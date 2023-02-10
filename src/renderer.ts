import {FormatFlags, Profile, TransformFlags} from '../wasm/lcms/lcms'
import {WithMalloc} from './lcms'

export class Renderer {
  private _lcms: WithMalloc

  constructor(lcms: WithMalloc) {
    this._lcms = lcms
  }

  render(
    buffer: Uint8ClampedArray | Uint8Array,
    profile: Uint8Array
  ): Uint8ClampedArray | Uint8Array {
    return this._lcms.withCleanup((cleanup) => {
      // Allocate in one call to avoid memory migration in between
      const memory = this._lcms.alloc({
        length: buffer.length * 2,
        bytesPerElement: buffer.BYTES_PER_ELEMENT,
      })
      cleanup.push(() => this._lcms.free(memory))

      // TODO: Cache it somehow? But each memory migration might invalidate pointers?
      const destProfile = this._lcms.CreatesRGBProfile()
      cleanup.push(() => this._lcms.CloseProfile(destProfile))

      const srcProfile = this._lcms.OpenProfileFromMem(profile, profile.length)
      cleanup.push(() => this._lcms.CloseProfile(srcProfile))

      const {srcFormat, pixelCount, transformFlags} = this._copyToHeap(
        srcProfile,
        {
          src: buffer,
          dest: memory.subarray(0, buffer.length),
        }
      )
      const transform = this._lcms.CreateTransform(
        srcProfile,
        srcFormat,
        destProfile,
        this._lcms.TYPE_RGBA_8,
        this._lcms.INTENT_PERCEPTUAL,
        transformFlags
      )
      if (transform === 0) {
        throw new Error('Transform load failed')
      }

      cleanup.push(() => this._lcms.DeleteTransform(transform))

      const transformed = memory.subarray(buffer.length)

      // Initialize alpha to fully opaque in case src doesn't contain it
      transformed.fill(255)

      this._lcms.DoTransform(
        transform,
        this._lcms.toPtr(memory),
        this._lcms.toPtr(transformed),
        /* pixelCount, not array length */ pixelCount
      )

      const final = Uint8ClampedArray.from(transformed) // Copy over from asm.js heap

      return final
    })
  }

  iccProfileName(icc_profile: Uint8Array): string | null {
    return this._lcms.withCleanup((cleanup) => {
      const profile = this._lcms.OpenProfileFromMem(
        icc_profile,
        icc_profile.length
      )
      cleanup.push(() => this._lcms.CloseProfile(profile))

      const bytesRequired = this._lcms.GetProfileInfo(
        profile,
        this._lcms.INFO_TYPE.cmsInfoModel,
        'en',
        'us'
      )

      const heapBytes = this._lcms.alloc({
        bytesPerElement: 1,
        length: bytesRequired,
      })
      cleanup.push(() => this._lcms.free(heapBytes))

      const bytesWritten = this._lcms.GetProfileInfo(
        profile,
        this._lcms.INFO_TYPE.cmsInfoModel,
        'en',
        'us',
        this._lcms.toPtr(heapBytes),
        bytesRequired
      )
      console.assert(bytesWritten > 0, 'GetProfileInfo failed to return Model')
      console.assert(
        bytesWritten <= bytesRequired,
        'GetProfileInfo overflowed buffer'
      )
      const decoded = this._utf32Decode(
        heapBytes.subarray(0, bytesWritten - 4 /* NULL character at the end */)
      )
      return decoded
    })
  }

  // https://stackoverflow.com/a/64707714
  private _utf32Decode(bytes: Uint8Array): string {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    let result = ''

    for (let i = 0; i < bytes.length; i += 4) {
      result += String.fromCodePoint(view.getInt32(i, true))
    }

    return result
  }

  private _copyToHeap(
    srcProfile: Profile,
    {
      src,
      dest,
    }: {
      src: Uint8ClampedArray | Uint8Array
      dest: Uint8Array
    }
  ): {
    srcFormat: FormatFlags
    pixelCount: number
    transformFlags: TransformFlags
  } {
    let srcFormat = this._lcms.FormatterForColorspaceOfProfile(
      srcProfile,
      1,
      false
    )
    /*
     * Here comes the fun part: webtoon/psd decodes images in slightly weird way, packing everything into RGBA format and calling it a day. For given ICC
     * - RGB has extra channel: A, that's always 255
     * - CMYK is packed into RGBA with no conversion (so R is C, G is M, B is Y and A is K),
     * - Grayscale is cloned: R===G===B, A is always 255
     * - Grayscale A is similar to grayscale but A is used
     *
     * So this part requires both tweaking flags and (where not possible) adjusting memory layout
     * In next iteration we might prefer to write our own decoder in C
     */
    const colorspace = srcFormat >> 16
    const isGreyscale = colorspace === 3
    const isRGB = colorspace === 4
    const isCMYK = colorspace === 6

    let pixelCount = src.length / 4
    /**
     * When you create a color transform across formats holding alpha channels,
     * the color engine by default does just nothing. It skips the alpha
     * channels so you are free to initialize the result with opaque or
     * transparent alpha. This is also to keep compatibility with old versions
     * of Little CMS.
     * */
    let transformFlags = this._lcms.FLAGS_COPY_ALPHA

    if (isRGB) {
      // TODO: test on RGBA
      /* Extra 1 (A) channel, even if ICC thinks it is RGB */
      srcFormat |= this._lcms.RGBA_XOR_RGB
      dest.set(src)
    }
    if (isCMYK) {
      // LCMS expects CMYK in range 0-100
      // NOTE: maybe it should be `0xff XOR src[i]`? Or maybe it's pre-multipled with alpha?
      for (let i = 0; i < src.length; i += 1) {
        dest[i] = 255 - src[i]
      }
    }
    if (isGreyscale) {
      // TODO: test on Greyscale w/ Alpha
      /* Extra 3 (GBA) channels - pack it together */
      for (let i = 0; i < pixelCount; i += 1) {
        dest[i] = src[4 * i]
      }
    }
    return {srcFormat, pixelCount, transformFlags}
  }
}

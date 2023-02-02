import {FormatFlags, Profile, TransformFlags} from '../wasm/lcms/lcms'
import {WithMalloc} from './lcms'

export class Renderer {
  constructor(private lcms: WithMalloc) {}

  render(
    buffer: Uint8ClampedArray | Uint8Array,
    profile?: Uint8Array
  ): Uint8ClampedArray | Uint8Array {
    if (!profile) {
      return buffer
    }

    return this.lcms.withCleanup((cleanup) => {
      // Allocate in one call to avoid memory migration in between
      const memory = this.lcms.alloc({
        length: buffer.length * 2,
        bytesPerElement: buffer.BYTES_PER_ELEMENT,
      })
      cleanup.push(() => this.lcms.free(memory))

      // TODO: Cache it somehow? But each memory migration might invalidate pointers?
      const destProfile = this.lcms.CreatesRGBProfile()
      cleanup.push(() => this.lcms.CloseProfile(destProfile))

      const srcProfile = this.lcms.OpenProfileFromMem(profile, profile.length)
      cleanup.push(() => this.lcms.CloseProfile(srcProfile))

      const {srcFormat, pixelCount, transformFlags} = this.copyToHeap(
        srcProfile,
        {
          src: buffer,
          dest: memory.subarray(0, buffer.length),
        }
      )
      const transform = this.lcms.CreateTransform(
        srcProfile,
        srcFormat,
        destProfile,
        this.lcms.TYPE_RGBA_8,
        this.lcms.INTENT_PERCEPTUAL,
        transformFlags
      )
      if (transform === 0) {
        throw new Error('Transform load failed')
      }

      const transformed = memory.subarray(buffer.length)

      // Initialize alpha to fully opaque in case src doesn't contain it
      transformed.fill(255)

      this.lcms.DoTransform(
        transform,
        this.lcms.toPtr(memory),
        this.lcms.toPtr(transformed),
        /* pixelCount, not array length */ pixelCount
      )

      this.lcms.DeleteTransform(transform)

      const final = Uint8ClampedArray.from(transformed) // Copy over from asm.js heap

      return final
    })
  }

  private copyToHeap(
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
    let srcFormat = this.lcms.FormatterForColorspaceOfProfile(
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
    let transformFlags = this.lcms.FLAGS_COPY_ALPHA

    if (isRGB) {
      // TODO: test on RGBA
      /* Extra 1 (A) channel, even if ICC thinks it is RGB */
      srcFormat |= this.lcms.RGBA_XOR_RGB
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

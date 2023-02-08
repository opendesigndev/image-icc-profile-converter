import {WithMalloc} from '../lcms'

type Psd = {
  icc_profile?: Uint8Array
}

// https://stackoverflow.com/a/64707714
function utf32Decode(bytes: Uint8Array): string {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let result = ''

  for (let i = 0; i < bytes.length; i += 4) {
    result += String.fromCodePoint(view.getInt32(i, true))
  }

  return result
}

export function iccProfileName(psd: Psd, lcms: WithMalloc): string | null {
  const icc_profile = psd.icc_profile
  if (!icc_profile) {
    return null
  }
  return lcms.withCleanup((cleanup) => {
    const profile = lcms.OpenProfileFromMem(icc_profile, icc_profile.length)
    cleanup.push(() => lcms.CloseProfile(profile))

    const bytesRequired = lcms.GetProfileInfo(
      profile,
      lcms.INFO_TYPE.cmsInfoModel,
      'en',
      'us'
    )

    const heapBytes = lcms.alloc({
      bytesPerElement: 1,
      length: bytesRequired,
    })
    cleanup.push(() => lcms.free(heapBytes))

    const bytesWritten = lcms.GetProfileInfo(
      profile,
      lcms.INFO_TYPE.cmsInfoModel,
      'en',
      'us',
      lcms.toPtr(heapBytes),
      bytesRequired
    )
    console.assert(bytesWritten > 0, 'GetProfileInfo failed to return Model')
    console.assert(
      bytesWritten <= bytesRequired,
      'GetProfileInfo overflowed buffer'
    )
    const decoded = utf32Decode(
      heapBytes.subarray(0, bytesWritten - 4 /* NULL character at the end */)
    )
    return decoded
  })
}

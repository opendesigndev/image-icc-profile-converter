import {dirname} from 'path'
import {createRequire} from 'module'
globalThis.__dirname = dirname(import.meta.url).substring(7)
globalThis.require = createRequire(import.meta.url)

import Lcms from '../wasm/lcms'

// a quirk of emscripten - ES6 module is just a namespace wrapper over CJS
let lcms = undefined as Promise<WithMalloc> | undefined

export default () => {
  lcms ||= Lcms()
    .then(({ready}) => ready)
    .then((lcms) => {
      lcms.SetConsoleLogErrorHandler()

      return WithMalloc(lcms)
    })
  return lcms
}

type LcmsModule = Awaited<Awaited<ReturnType<typeof Lcms>>['ready']>
type Defer = () => void
type Cleanup = Defer[]

export interface WithMalloc extends LcmsModule {
  free: (memory: Uint8Array) => void
  alloc: (params: {length: number; bytesPerElement: number}) => Uint8Array
  toPtr: (memory: Uint8Array) => number
  withCleanup: <A>(cb: (cleanup: Cleanup) => A) => A
}

function WithMalloc(base: LcmsModule): WithMalloc {
  return {
    ...base,
    free: (memory) => {
      base._free(memory.byteOffset)
    },

    alloc: ({length, bytesPerElement}) => {
      var numBytes = length * bytesPerElement
      var ptr = base._malloc(numBytes)
      var heapBytes = base.HEAPU8.subarray(ptr, ptr + numBytes)
      return heapBytes
    },

    toPtr: ({byteOffset}) => byteOffset,

    withCleanup: <A>(cb: (cleanup: Cleanup) => A) => {
      const cleanup: Cleanup = []
      try {
        return cb(cleanup)
      } finally {
        cleanup.forEach((f) => f())
      }
    },
  }
}

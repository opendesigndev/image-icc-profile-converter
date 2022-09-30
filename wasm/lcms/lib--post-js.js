/// <reference types="emscripten" />
/** Above will import declarations from @types/emscripten, including Module etc. */
/** It is not .ts file but declaring reference will pass TypeScript Check. */

Module.ready.then(() => {
  Module['OpenProfileFromMem'] = cwrap('OpenProfileFromMem', 'number', ['array', 'number']);
  Module['CreatesRGBProfile'] = cwrap('CreatesRGBProfile', 'number', []);
  Module['OpenProfileFromFile'] = cwrap('OpenProfileFromFile', 'number', ['string', 'string']);
  Module['FormatterForColorspaceOfProfile'] = cwrap('FormatterForColorspaceOfProfile', 'number', ['number', 'number', 'boolean']);
  Module['CreateTransform'] = cwrap('CreateTransform', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);
  Module['CloseProfile'] = cwrap('CloseProfile', 'boolean', ['number']);
  // NOTE: we can't use 'array' here since these are stack-allocated
  // Instead we need to manually allocate heap memory (with malloc) and pass a pointer here
  Module['DoTransform'] = cwrap('DoTransform', null, ['number', 'number', 'number', 'number']);
  Module['DeleteTransform'] = cwrap('DeleteTransform', null, ['number']);
  Module['GetProfileInfo'] = cwrap('GetProfileInfo', 'number', ['number', 'number', 'string', 'string', 'number', 'number']);
  Module['TYPE_RGBA_8'] = ccall('constTypeRGBA8', 'number', [], []);
  Module['TYPE_CMYK_8'] = ccall('constTypeCMYK8', 'number', [], []);
  Module['INTENT_PERCEPTUAL'] = ccall('constIntentPerceptual', 'number', [], []);
  Module['FLAGS_COPY_ALPHA'] = ccall('constFlagsCopyAlpha', 'number', [], []);
  Module['SetConsoleLogErrorHandler'] = cwrap('SetConsoleLogErrorHandler', null, []);

  Module['INFO_TYPE'] = {
    cmsInfoDescription: 0,
    cmsInfoManufacturer: 1,
    cmsInfoModel: 2,
    cmsInfoCopyright: 3
  }

  Module['RGBA_XOR_RGB'] = 1 << 7
})

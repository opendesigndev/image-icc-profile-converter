/// <reference types="emscripten" />
/** Above will import declarations from @types/emscripten, including Module etc. */
/** It is not .ts file but declaring reference will pass TypeScript Check. */

Module['onRuntimeInitialized'] = function () {
  Module['OpenProfileFromMem'] = cwrap('_OpenProfileFromMem', 'number', ['number', 'number']);
  Module['OpenProfileFromFile'] = cwrap('_OpenProfileFromFile', 'number', ['string', 'string']);
  Module['CreateTransform'] = cwrap('_CreateTransform', 'number', ['number', 'number', "number", "number", "number", "number"]);
  Module['CloseProfile'] = cwrap('_CloseProfile', 'boolean', ['number']);
  Module['DoTransform'] = cwrap('_DoTransform', null, ['number', 'buffer', "buffer", "number"]);
  Module['DeleteTransform'] = cwrap('_DeleteTransform', null, ['number']);
}

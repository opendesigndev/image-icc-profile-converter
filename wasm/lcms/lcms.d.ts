/// <reference types="emscripten" />
/** Above will import declarations from @types/emscripten, including Module etc. */

export type Profile = number;
export type Transform = number;

// This will merge to the existing EmscriptenModule interface from @types/emscripten
export interface LcmsModule extends EmscriptenModule {
  // Module.cwrap() will be available by doing this.
  // Requires -s "EXPORTED_RUNTIME_METHODS=['cwrap']"
  cwrap: typeof cwrap;
  // Exported from lib.cpp
  OpenProfileFromMem(mem: ArrayBuffer, size: number): Profile;
  OpenProfileFromFile(filename: string, accessMode: "r"): Profile;
  CreateTransform(
    input: Profile,
    inputFormat: number,
    output: Profile,
    outputFormat: number,
    intent: number,
    flags: number
  ): Transform;
  DoTransform(
    transform: Transform,
    input: ArrayBuffer,
    output: ArrayBuffer,
    size: number
  );
  DeleteTransform(transform: Transform);
}

// Declare any name
declare const lcmsModule: LcmsModule;
// Only for -s MODULARIZE=1
// export = addModule;
// Only for -s MODULARIZE=1 -s EXPORT_ES6=1
export default lcmsModule;

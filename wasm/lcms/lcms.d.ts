/// <reference types="emscripten" />
/** Above will import declarations from @types/emscripten, including Module etc. */

export type Ptr = number
export type Flag = number
export type Profile = Ptr;
export type Transform = Ptr;
export type FormatFlags = Flag;
export type Intent = number;
export type BufferPtr = Ptr;
export type TransformFlags = Flag;
export type AllocFailure = 0;
export type InfoType = number;
export type InfoTypeKey =
  | "cmsInfoDescription"
  | "cmsInfoManufacturer"
  | "cmsInfoModel"
  | "cmsInfoCopyright";

// This will merge to the existing EmscriptenModule interface from @types/emscripten
export interface LcmsModule extends EmscriptenModule {
  // Module.cwrap() will be available by doing this.
  // Requires -s "EXPORTED_RUNTIME_METHODS=['cwrap']"
  cwrap: typeof cwrap;
  // Exported from lib.c
  OpenProfileFromMem(mem: ArrayBuffer, size: number): Profile;
  // Create sRGB profile, not creates RGB profile :)
  CreatesRGBProfile(): Profile;
  GetProfileInfo(
    profile: Profile,
    infoType: InfoType,
    languageCode: string,
    countryCode: string,
    wcharBuffer?: number,
    bufferSize?: number
  ): number;
  FormatterForColorspaceOfProfile(
    profile: Profile,
    nBytes: number,
    isFloat: boolean
  ): FormatFlags;
  CreateTransform(
    input: Profile,
    inputFormat: FormatFlags,
    output: Profile,
    outputFormat: FormatFlags,
    intent: Intent,
    flags: TransformFlags
  ): Transform | AllocFailure;
  DoTransform(
    transform: Transform,
    input: BufferPtr,
    output: BufferPtr,
    /** Number of pixels to transform.
     * e.g. for RGBA it's array length divided by 4
     * */
    pixelCount: number
  );
  DeleteTransform(transform: Transform);
  CloseProfile(profile: Profile);
  SetConsoleLogErrorHandler();
  TYPE_RGBA_8: FormatFlags;
  TYPE_CMYK_8: FormatFlags;
  INTENT_PERCEPTUAL: Intent;
  FLAGS_COPY_ALPHA: TransformFlags;
  INFO_TYPE: Record<InfoTypeKey, InfoType>;
  RGBA_XOR_RGB: FormatFlags
}

// Declare any name
declare const lcmsModule: () => Promise<{ ready: Promise<LcmsModule> }>;
// Only for -s MODULARIZE=1
// export = addModule;
// Only for -s MODULARIZE=1 -s EXPORT_ES6=1
export default lcmsModule;

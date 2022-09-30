#include "emscripten.h"
#include "lcms2.h"

/*
 * https://emscripten.org/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html#interacting-with-an-api-written-in-c-c-from-nodejs
 */

EMSCRIPTEN_KEEPALIVE
/* cmsOpenProfileFromMem */
cmsHPROFILE OpenProfileFromMem(const void *MemPtr, cmsUInt32Number dwSize) {
  return cmsOpenProfileFromMem(MemPtr, dwSize);
}

EMSCRIPTEN_KEEPALIVE
cmsHPROFILE CreatesRGBProfile() { return cmsCreate_sRGBProfile(); }

EMSCRIPTEN_KEEPALIVE
/*
** Gets several information strings from the profile, dealing with localization.
** Strings are returned as wide chars.
**
** Parameters:
** hProfile: Handle to a profile
** object Info: A selector of which info to return
** Language Code: first name language code from ISO-639/2.
** Country Code: first name region code from ISO-3166.
** Buffer: pointer to a memory block to get the result. NULL to calculate size
*only
** BufferSize: Amount of byes allocated in Buffer, or 0 to calculate size only.
** Returns:
** Number of required bytes to hold the result. 0 on error.
*/
cmsUInt32Number GetProfileInfo(cmsHPROFILE hProfile, cmsInfoType Info,
                               const char LanguageCode[3],
                               const char CountryCode[3], wchar_t *Buffer,
                               cmsUInt32Number BufferSize) {
  return cmsGetProfileInfo(hProfile, Info, LanguageCode, CountryCode, Buffer,
                           BufferSize);
}

EMSCRIPTEN_KEEPALIVE
/*  cmsFormatterForColorspaceOfProfile */
cmsUInt32Number FormatterForColorspaceOfProfile(cmsHPROFILE hProfile,
                                                cmsUInt32Number nBytes,
                                                cmsBool lIsFloat) {
  return cmsFormatterForColorspaceOfProfile(hProfile, nBytes, lIsFloat);
}

EMSCRIPTEN_KEEPALIVE
/* cmsCreateTransform */
cmsHTRANSFORM CreateTransform(cmsHPROFILE Input, cmsUInt32Number InputFormat,
                              cmsHPROFILE Output, cmsUInt32Number OutputFormat,
                              cmsUInt32Number Intent, cmsUInt32Number dwFlags) {
  return cmsCreateTransform(Input, InputFormat, Output, OutputFormat, Intent,
                            dwFlags);
}

EMSCRIPTEN_KEEPALIVE
/* cmsCloseProfile */
cmsBool CloseProfile(cmsHPROFILE hProfile) { return cmsCloseProfile(hProfile); }

EMSCRIPTEN_KEEPALIVE
/* cmsDoTransform */
void DoTransform(cmsHTRANSFORM Transform, const void *InputBuffer,
                 void *OutputBuffer, cmsUInt32Number Size) {

  cmsDoTransform(Transform, InputBuffer, OutputBuffer, Size);
}

EMSCRIPTEN_KEEPALIVE
/* cmsDeleteTransform */
void DeleteTransform(cmsHTRANSFORM hTransform) {
  cmsDeleteTransform(hTransform);
}

// CONSTANTS
EMSCRIPTEN_KEEPALIVE
cmsUInt32Number constTypeRGBA8() { return TYPE_RGBA_8; }

EMSCRIPTEN_KEEPALIVE
cmsUInt32Number constTypeCMYK8() { return TYPE_CMYK_8; }

EMSCRIPTEN_KEEPALIVE
cmsUInt32Number constIntentPerceptual() { return INTENT_PERCEPTUAL; }

EMSCRIPTEN_KEEPALIVE
cmsUInt32Number constFlagsCopyAlpha() { return cmsFLAGS_COPY_ALPHA; }

// Error handling
void ConsoleErrorHandler(cmsContext ContextID, cmsUInt32Number ErrorCode,
                         const char *Text) {
  printf("[lcms]> %s\n", Text);
}

EMSCRIPTEN_KEEPALIVE
void SetConsoleLogErrorHandler() {
  cmsSetLogErrorHandler(ConsoleErrorHandler);
  printf("[lcms]> LogErrorHandler set\n");
};

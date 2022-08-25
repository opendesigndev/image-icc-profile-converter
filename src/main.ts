import Psd from "../wasm/psd/packages/psd";
import Module from "../wasm/lcms";

export async function parse(buffer: ArrayBuffer) {
  const psd = Psd.parse(buffer);
  const destProfile = Module.OpenProfileFromFile(
    "/icc/sRGB_v4_ICC_preference.icc",
    "r"
  );

  return {
    psd,
    destProfile,
  };
}

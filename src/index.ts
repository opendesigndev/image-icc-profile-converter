import Psd from "../wasm/psd/packages/psd";
import { Extractor } from "./extractor";
import lcms from "./lcms";
import { Renderer } from "./renderer";

export interface ParsedFile {
  readonly psd: Psd;
  readonly renderer: Renderer;
  readonly extractor: Extractor;
}

export async function parse(buffer: ArrayBuffer): Promise<ParsedFile> {
  const psd = Psd.parse(buffer);
  const renderer = new Renderer(psd, await lcms());
  const extractor = new Extractor(psd, await lcms());

  return {
    psd,
    renderer,
    extractor,
  };
}

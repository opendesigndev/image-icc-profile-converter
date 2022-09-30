import Psd, { ColorMode, Layer } from "../wasm/psd/packages/psd";
import { Synthesizable } from "../wasm/psd/packages/psd/dist/classes";
import { iccProfileName } from "./extractor/iccProfileName";
import { WithMalloc } from "./lcms";

export class Extractor {
  constructor(private readonly psd: Psd, private readonly lcms: WithMalloc) {}

  // https://gitlab.avcd.cz/avocode/psd-tools/-/blob/master/src/psd_tools/json_encoder/document.py#L18
  document(): Record<string, unknown> {
    return {
      profile: iccProfileName(this.psd, this.lcms),
      mode: ColorMode[this.psd.colorMode],
      bounds: this.bounds,
      guides: this.psd.guides,
      depth: this.psd.depth,
      // TODO: export from webtoon/psd
      globalLight: {
        angle: 30,
        altitude: 30,
      },
      resolution: 72,
      layers: this.layers(),
    };
  }

  // https://gitlab.avcd.cz/backend/psd-parser-worker/-/blob/master/psd_parser_worker/processing/save_resources.py#L66
  bitmaps(): {
    bitmaps: Record<number, Synthesizable>;
    userMasks: Record<number, ImageData>;
  } {
    const bitmaps = {} as Record<number, Synthesizable>;
    const userMasks = {};
    this.psd.layers.forEach((layer, idx) => {
      if (layer.children) {
        // NOTE: layers already iterates over all children so no need to recurse deeper
        return;
      }
      // TODO: stable ID? Maybe generate one when parsing?
      bitmaps[idx] = layer;
      // TODO: layer usermask
    });
    return { bitmaps, userMasks };
  }

  // https://gitlab.avcd.cz/backend/psd-parser-worker/-/blob/master/psd_parser_worker/processing/save_resources.py#L51
  patterns(): Record<string, ImageData> {
    // TODO: add user patterns to webtoon/psd
    return {};
  }

  // https://gitlab.avcd.cz/backend/psd-parser-worker/-/blob/master/psd_parser_worker/processing/embedded.py
  embedded(): Record<string, unknown> {
    // TODO: add embedded to webtoon/psd
    return {};
  }

  private layers(): Record<string, unknown>[] {
    if (this.psd.layers.length == 0) {
      return [this.backgroundLayer()];
    }
    return this.psd.layers.map((layer) => this.encodeLayer(layer));
  }

  private backgroundLayer(): Record<string, unknown> {
    const [left, top, width, height] = this.bounds;
    return this.encodeLayer({
      isHidden: false,
      type: "backgroundLayer",
      name: "Background",
      top,
      left,
      width,
      height,
    } as any as Layer);
  }

  // https://gitlab.avcd.cz/avocode/psd-tools/-/blob/master/src/psd_tools/json_encoder/layer.py#L204
  private encodeLayer(layer: Layer): Record<string, unknown> {
    return {
      name: layer.name,
      visible: !layer.isHidden,
      // TODO: expose also right and bottom? Maybe expose whole bounds?
      bounds: [
        layer.left,
        layer.top,
        layer.left + layer.width,
        layer.top + layer.height,
      ],
      // TODO: derive from existing info?
      // backgroundLayer | layerSection | shapeLayer | textLayer | adjustmentLayer
      type: layer.type,
      imageEffectsApplied: false,
      // TODO generate in webtoon/psd?
      id: "",
      // TODO: add to webtoon
      clipped: false,
      // TODO: add to webtoon
      maskedBy: null,
      // TODO: expose known tagged blocks
      // https://gitlab.avcd.cz/avocode/psd-tools/-/blob/master/src/psd_tools/json_encoder/tagged_blocks/__init__.py#L35
      // TODO: expose info required to compute blendMode
      blendMode: null,
      // TODO: expose user mask info
      mask: null,
    };
  }

  private get bounds() {
    return [0, 0, this.psd.width, this.psd.height];
  }
}

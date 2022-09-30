import * as fs from "fs";
import * as path from "path";
import { beforeAll, describe, expect, it } from "vitest";
import { Extractor } from "../src/extractor";

import { parse } from "../src/index";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

/**
 * Test helper function that loads a PSD file and calls `PSD.parse()` on it.
 * @param fileName Name of PSD file under `FIXTURE_DIR` directory
 * @returns Callback that parses the loaded data as a `Psd` object
 */
function parsePsdFile(fileName: string) {
  const data = fs.readFileSync(path.resolve(FIXTURE_DIR, fileName));
  return parse(data.buffer);
}

describe("Extractor", () => {
  let extractor: Extractor;
  beforeAll(async () => {
    const parsed = await parsePsdFile("SWOP.psd");
    extractor = parsed.extractor;
  });

  describe("document()", () => {
    it("returns profile name", async () => {
      const { profile } = extractor.document();
      expect(profile).toBe("U.S. Web Coated (SWOP) v2");
    });

    it("returns color mode", async () => {
      const { mode } = extractor.document();
      expect(mode).toBe("Cmyk");
    });

    it("returns bounds", async () => {
      const { bounds } = extractor.document();
      expect(bounds).toStrictEqual([0, 0, 1, 1]);
    });

    it("returns guides", async () => {
      const { guides } = extractor.document();
      expect(guides).toStrictEqual([]);
    });

    it("returns depth", async () => {
      const { depth } = extractor.document();
      expect(depth).toStrictEqual(8);
    });
  });
});

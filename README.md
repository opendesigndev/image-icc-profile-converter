# Octopus Converter for Photoshop

## How to build:

1. install nix-shell
2. run `nix-shell` command in root
3. run `yarn workspace lcms build` inside nix-shell
4. run `yarn build`

---

## How to use:

```
import { getRenderer } from '@opendesign/image-icc-profile-converter'

    const renderer = await getRenderer()
    const processed_image = renderer.render(buff, iccProfile)

```

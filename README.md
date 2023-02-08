# Octopus Converter for Photoshop

## How to build:

1. install [`nix`](https://nixos.org/download.html#download-nix). Also take a look at our [useful tools setup](https://www.notion.so/avocode/Useful-dev-tools-d51294acc5ba4d95a8a36a65518c5f1f). 
1. run `nix-shell` command in root
2. run `yarn workspace lcms build` inside nix-shell
3. run `yarn build`

---

## How to use:

```
import { getRenderer } from '@opendesign/image-icc-profile-converter'

    const renderer = await getRenderer()
    const processed_image = renderer.render(buff, iccProfile)

```

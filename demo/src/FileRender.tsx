import { ParsedFile } from './store';

import { createEffect, createSignal, onMount } from "solid-js";
import { Badge, Divider, Flex, Spacer, VStack } from '@hope-ui/solid';


const FileRender = ({ parsed: { psd, renderer } }: { parsed: ParsedFile }) => {
    let canvas: HTMLCanvasElement | undefined = undefined;

    const [midPoint, setMidPoint] = createSignal(psd.width / 2)
    const [images, setImages] = createSignal([undefined, undefined] as (ImageData | undefined)[])

    onMount(async () => {
        setImages([
            await renderer.render(psd),
            new ImageData(await psd.composite(), psd.width, psd.height),
        ])
    });


    createEffect(() => {
        const ctx = canvas!.getContext("2d");
        const [imageFixed, imageRaw] = images()
        if (ctx && imageRaw && imageFixed) {
            ctx.restore()
            ctx.save()

            ctx.putImageData(imageFixed, 0, 0);
            const visibleFixed = ctx.getImageData(midPoint(), 0, psd.width, psd.height)

            ctx.restore()

            /* ctx.fillStyle = 'blue';
* ctx.fillRect(0, 0, psd.width, psd.height); */
            ctx.putImageData(imageRaw, 0, 0, 0, 0, midPoint(), psd.height);

            /* ctx.fillStyle = 'red';
* ctx.fillRect(midPoint(), 0, psd.width, psd.height); */
            ctx.putImageData(visibleFixed, midPoint(), 0);

            ctx.beginPath();
            ctx.lineWidth = 13;
            ctx.strokeStyle = 'black';
            ctx.moveTo(midPoint(), 0);
            ctx.lineTo(midPoint(), psd.height);
            ctx.stroke();
        }

    })

    const setMidPointHandler = (ev: Event) => {
        setMidPoint((ev.target! as HTMLInputElement).valueAsNumber)
    }

    return <VStack>
        <Divider height='1em' />
        <Flex style={{ width: '100%', "padding-top": '10px' }}>
            <Badge colorScheme='warning'>raw</Badge>
            <Spacer />
            <Divider orientation="vertical" />
            <Spacer />
            <Badge colorScheme='success'>w/ ICC profile applied</Badge>
        </Flex>
        <div class="slidecontainer" style={{ width: 'calc(100% + 1em)' }}>
            <input type="range" style={{ width: '100%' }} min="0" max={psd.width} value={midPoint()} class="slider" id="myRange" onInput={setMidPointHandler} />
        </div>
        <canvas ref={canvas} width={psd.width} height={psd.height} />
    </VStack>;
}
export default FileRender

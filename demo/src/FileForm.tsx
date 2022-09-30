import { useStoreon } from '@storeon/solidjs'
import { State, Events } from './store'
import { Component } from 'solid-js'
import {
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    VStack,
    FormControl,
    FormLabel,
    FormHelperText,
} from "@hope-ui/solid"

import { SiAdobephotoshop } from "solid-icons/si";

const FileForm: Component = () => {
    const [_state, dispatch] = useStoreon<State, Events>()


    function handleInput(ev: Event) {
        console.assert(ev.target, "missing target on", ev)
        const input = ev.target as HTMLInputElement

        console.assert(input.files, "missing files on", input)
        const file = (input.files as FileList)[0] as File

        dispatch("fileUploaded", file)
    }

    return (
        <VStack spacing="$6" width="100%">
            <FormControl>
                <FormLabel for="file">Photoshop file</FormLabel>
                <InputGroup id="file">
                    <InputLeftElement
                        pointerEvents="none"
                        color="$neutral8" >
                        <Icon as={SiAdobephotoshop} />
                    </InputLeftElement>
                    <Input
                        type="file"
                        placeholder="Pick Photoshop file"
                        accept="image/vnd.adobe.photoshop"
                        onInput={handleInput} />
                </InputGroup>
                <FormHelperText>All processing happens in the browser. No Internet required</FormHelperText>
            </FormControl>
        </VStack>
    )
}
export default FileForm

import {
    Button, hope, VStack
} from "@hope-ui/solid";

import { useStoreon } from '@storeon/solidjs';
import { AiOutlineForward } from "solid-icons/ai";
import { createSignal } from "solid-js";

import { Events, State } from './store';

import { parse } from "../../src"

const FileDetails = ({ file }: { file: File }) => {
    const [loading, setLoading] = createSignal(false)
    const [_state, dispatch] = useStoreon<State, Events>()
    const details = JSON.stringify({ name: file.name, size: file.size, type: file.type })

    async function onClick() {
        setLoading(true)
        try {
            const parsed = await parse(
                await file.arrayBuffer()
            )
            dispatch('fileParsed', parsed)
        } finally {
            setLoading(false)
        }
    }

    return (
        <VStack>
            <hope.code>
                {details}
            </hope.code>
            <Button loading={loading()} disabled={false} aria-label="Format" rightIcon={<AiOutlineForward />} onClick={onClick} >
                Parse
            </Button>
        </VStack>
    )
}
export default FileDetails

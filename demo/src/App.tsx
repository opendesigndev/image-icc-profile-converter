
import { useStoreon } from '@storeon/solidjs'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    Container, Divider, Center,
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    CloseButton
} from "@hope-ui/solid"
import { Show } from 'solid-js'
import type { Component } from 'solid-js'

import { State, Events } from './store'
import FileForm from './FileForm'
import FileDetails from './FileDetails'
import FileRender from './FileRender'

const App: Component = () => {
    const [state, dispatch] = useStoreon<State, Events>()
    return (
        <Container height="100%">
            <Breadcrumb>
                <BreadcrumbItem>
                    <BreadcrumbLink href="#" currentPage={!state.file} onClick={() => dispatch('home')}>Home</BreadcrumbLink>
                    <BreadcrumbSeparator />
                </BreadcrumbItem>
                <Show when={state.file}>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="#" currentPage={state.file && !state.parsed}>
                            {state.file!.name}
                        </BreadcrumbLink>
                        <BreadcrumbSeparator />
                    </BreadcrumbItem>
                </Show>
                <Show when={state.parsed}>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="#" currentPage={!!state.parsed}>
                            Details
                        </BreadcrumbLink>
                        <BreadcrumbSeparator />
                    </BreadcrumbItem>
                </Show>
            </Breadcrumb>
            <Show when={state.error}>
                <Alert status="danger">
                    <AlertIcon mr="$2_5" />
                    <AlertTitle mr="$2_5">Something went wrong</AlertTitle>
                    <AlertDescription>{state.error!.toString()}</AlertDescription>
                    <CloseButton position="absolute" right="8px" top="8px" onClick={() => dispatch('errorAcked')} />
                </Alert>
                <Divider />
            </Show>
            <Center>
                <Show when={!state.file} >
                    <FileForm />
                </Show>
                <Show when={state.file && !state.parsed}>
                    <FileDetails file={state.file!} />
                </Show>
                <Show when={state.parsed}>
                    <FileRender parsed={state.parsed!} />
                </Show>
            </Center>
        </Container>
    );
};

export default App;

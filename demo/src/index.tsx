/* @refresh reload */
import { render } from 'solid-js/web';

import App from './App';
import { StoreonProvider } from '@storeon/solidjs'
import { store } from './store'

import { HopeThemeConfig, HopeProvider } from '@hope-ui/solid'

import "./index.css"

const config: HopeThemeConfig = {
    initialColorMode: "system",
}

const makeApp = () => (
    <HopeProvider config={config}>
        <StoreonProvider store={store}>
            <App />
        </StoreonProvider>
    </HopeProvider>
)

render(makeApp, document.getElementById('root') as HTMLElement);

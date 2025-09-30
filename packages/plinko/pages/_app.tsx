import type { AppProps } from 'next/app';
import '../styles/globals.scss';
import { GameServiceProvider } from '../src/services/useGameService';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <GameServiceProvider>
            <Component {...pageProps} />
        </GameServiceProvider>
    );
}

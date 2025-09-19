import { useEffect, useRef } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function usePWAWoker() {
    const workerRef = useRef(null);

    useEffect(() => {
        try {
            if (window.Worker) {
                workerRef.current = new Worker(`${basePath}/worker.js`, { type: "module" });
                workerRef.current.onmessage = (evt) => workerRef.current.postMessage(evt.data);
            } else {
                console.log("Your browser doesn't support web workers.");
            }
        } catch (error) {
            console.log(error);
        }
        return () => {
            workerRef.current && workerRef.current.terminate();
        };
    }, []);

    return workerRef;
}

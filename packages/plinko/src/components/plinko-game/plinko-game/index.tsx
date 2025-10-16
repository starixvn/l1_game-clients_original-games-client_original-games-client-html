"use client";
import PlinkoCanvas from "./canvas";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { PLINKO_CANVAS_SCALE } from "./constant";
import Slots from "./slots";

const Game = () => {
    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);
    
    const handleDownloadLogs = () => {
        if ((window as any).plinkoSlotValidation) {
            (window as any).plinkoSlotValidation.downloadLogs();
        } else {
            console.warn("Plinko slot validation not available yet");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            
            <div className="rounded-lg mx-auto w-full h-[600px] overflow-x-hidden pt-5">
              
                <div
                    className="absolute origin-top left-1/2 z-[-1]"
                    style={{
                        transform: `translateX(-50%) translateY(${numberOfRows + numberOfRows / 8}px) scale(${
                            PLINKO_CANVAS_SCALE[numberOfRows]
                        })`,
                    }}
                >
                    <PlinkoCanvas />
                </div>
                <div className="absolute top-[570px] left-0 w-full flex items-center justify-center origin-top">
                    <Slots />
                </div>
                <div className="flex gap-2 mb-4">
                    <button 
                        onClick={handleDownloadLogs}
                        className=" text-white rounded hover:bg-blue-600"
                    >
                        Logs
                    </button>
                </div>
            </div>
        </div>
    );
};
export default Game;

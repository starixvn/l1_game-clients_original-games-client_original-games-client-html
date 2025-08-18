import { create } from "zustand";
import { GlobalEventsSlice, createGlobalEventsSlice } from "./global-events-slice";

export type GlobalEventsStore = GlobalEventsSlice;

export const useGlobalEventsStore = create<GlobalEventsStore>()((...a) => {
    const globalEventsSlice = createGlobalEventsSlice(...a);
    
    return {
        ...globalEventsSlice,
    };
});

export default useGlobalEventsStore;

import { create } from "zustand";
import { GlobalEventsSlice, createGlobalEventsSlice } from "./global-events-slice";

export type GlobalEventsStore = GlobalEventsSlice;

export const useGlobalEventsStore = create<GlobalEventsStore>()((...args) => {
    const globalEventsSlice = createGlobalEventsSlice(...args);

    return {
        ...globalEventsSlice,
    };
});

export default useGlobalEventsStore;

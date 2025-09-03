import { create } from "zustand";
import { PopupSlice, createPopupSlice } from "./popup-slice";

export type PopupStore = PopupSlice;

export const usePopupStore = create<PopupStore>()((set, ...args) => {
    const popupSlice = createPopupSlice(set, ...args);

    return {
        ...popupSlice,
    };
});

export default usePopupStore;

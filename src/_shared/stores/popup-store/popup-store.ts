import { create } from "zustand";
import { PopupSlice, createPopupSlice } from "./popup-slice";

export type PopupStore = PopupSlice;

export const usePopupStore = create<PopupStore>()((set, ...a) => {
    const popupSlice = createPopupSlice(set, ...a);

    return {
        ...popupSlice,
        
    };
});

export default usePopupStore; 
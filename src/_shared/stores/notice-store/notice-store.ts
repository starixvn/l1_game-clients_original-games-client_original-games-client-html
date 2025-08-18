import { create } from "zustand";
import { NoticeSlice, createNoticeSlice } from "./notice-slice";

export type NoticeStore = NoticeSlice;

export const useNoticeStore = create<NoticeStore>()((...a) => {
    const noticeSlice = createNoticeSlice(...a);

    return {
        ...noticeSlice,
    };
});

export default useNoticeStore;

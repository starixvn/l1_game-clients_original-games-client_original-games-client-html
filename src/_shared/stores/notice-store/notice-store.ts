import { create } from "zustand";
import { NoticeSlice, createNoticeSlice } from "./notice-slice";

export type NoticeStore = NoticeSlice;

export const useNoticeStore = create<NoticeStore>()((...args) => {
    const noticeSlice = createNoticeSlice(...args);

    return {
        ...noticeSlice,
    };
});

export default useNoticeStore;

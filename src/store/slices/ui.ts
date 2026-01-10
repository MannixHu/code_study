/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * UI Store
 * 使用 Zustand 管理 UI 相关的全局状态
 */

import { create } from "zustand";
import type { UiStore } from "../../shared/types/store";

interface UIStore extends UiStore {
  showHint: boolean;
  hintIndex: number;
  setShowHint: (show: boolean) => void;
  setHintIndex: (index: number) => void;
}

interface EditorLayout {
  [key: string]: any;
}

export const useUIStore = create<UIStore>((set) => ({
  // 初始状态
  showHint: false,
  hintIndex: 0,
  sidebarVisible: true,
  editorLayout: "vertical",
  theme: "light",

  // 设置是否显示提示
  setShowHint: (show: boolean) => {
    set({ showHint: show });
  },

  // 设置提示索引
  setHintIndex: (index: number) => {
    set({ hintIndex: index });
  },

  // 设置侧边栏显示
  setSidebarVisible: (visible: boolean) => {
    set({ sidebarVisible: visible });
  },

  // 显示下一个提示
  nextHint: (maxHints: number) => {
    set((state) => {
      if (state.hintIndex < maxHints - 1) {
        return { hintIndex: state.hintIndex + 1, showHint: true };
      }
      return state;
    });
  },

  // 重置提示
  resetHint: () => {
    set({
      showHint: false,
      hintIndex: 0,
    });
  },

  // 切换侧边栏显示
  toggleSidebar: () => {
    set((state) => ({
      sidebarVisible: !state.sidebarVisible,
    }));
  },

  // 设置编辑器布局
  setEditorLayout: (layout: EditorLayout) => {
    set({ editorLayout: layout });
  },

  // 切换主题
  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    }));
  },
}));

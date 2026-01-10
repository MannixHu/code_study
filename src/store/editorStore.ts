/**
 * Editor Store
 * 使用 Zustand 管理代码编辑器的状态
 */

import { create } from 'zustand'
import type { EditorStore } from '../types/store'
import { progressRepository } from '../repository'

export const useEditorStore = create<EditorStore>((set) => ({
  // 初始状态
  userCode: '',
  isSaved: true,
  lastSavedCode: '',

  // 设置用户代码
  setUserCode: (code: string) => {
    set((state) => ({
      userCode: code,
      isSaved: code === state.lastSavedCode,
    }))
  },

  // 重置代码为初始值
  resetCode: async (lessonId: string) => {
    try {
      const progress = await progressRepository.getProgress(lessonId)
      if (progress?.userCode) {
        set({
          userCode: progress.userCode,
          lastSavedCode: progress.userCode,
          isSaved: true,
        })
      } else {
        set({
          userCode: '',
          lastSavedCode: '',
          isSaved: true,
        })
      }
    } catch (error) {
      console.error('Failed to reset code:', error)
      set({
        userCode: '',
        lastSavedCode: '',
        isSaved: true,
      })
    }
  },

  // 加载已保存的代码
  loadSavedCode: async (lessonId: string) => {
    try {
      const progress = await progressRepository.getProgress(lessonId)
      if (progress?.userCode) {
        set({
          userCode: progress.userCode,
          lastSavedCode: progress.userCode,
          isSaved: true,
        })
      }
    } catch (error) {
      console.error('Failed to load saved code:', error)
    }
  },

  // 标记代码为已保存
  markAsSaved: () => {
    set((state) => ({
      lastSavedCode: state.userCode,
      isSaved: true,
    }))
  },
}))

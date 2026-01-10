export interface ProgressState {
  completedLessonIds: Set<string>
  currentProgress: number
}

export interface ProgressRecord {
  lessonId: string
  categoryId: string
  completedAt: number
  score?: number
}

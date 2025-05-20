
export type Quiz = {
  id?: string
  title: string
  description: string
  tags: string[]
  difficulty: number
  source: string
  questions: {
    question_text: string
    options: { [key: string]: string} 
    correct_option: string
    difficulty: number
  }[]
}
export type Room = {
    id: string
    title: string
    description?: string
    tags?: string[]
    created_at: string
    user_id: string
  }

export type SortOrder = "name-asc" | "name-desc" | "date-asc" | "date-desc" 


//sort a list of objects with keys like created_at and title
export const SortMethods = {
  "name-asc": (a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title),
  "name-desc": (a: { title: string }, b: { title: string }) => b.title.localeCompare(a.title),
  "date-asc": (a: { created_at: string }, b: { created_at: string }) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  "date-desc": (a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
}
import { diaryService } from "../../services/diaryService"
import { useAppQuery } from "../useAppQuery"

export const useNotesByDiary = (id: number) => {
    return useAppQuery({
        queryKey: ["notes by diary", id],
        queryFn: () => diaryService.GetNotes(id)
    })
}
import { diaryService } from "../../services/diaryService"
import { useAppQuery } from "../useAppQuery"

export const useNotesByDiary = (id: number) => {
    return useAppQuery({
        queryKey: ["notes by diary"],
        queryFn: () => diaryService.GetNotes(id)
    })
}
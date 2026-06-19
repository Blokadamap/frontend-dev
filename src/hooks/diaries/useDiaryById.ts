import { diaryService } from "../../services/diaryService"
import { useAppQuery } from "../useAppQuery"

export const useDiaryById = (id: number) => {
    return useAppQuery({
        queryKey: ["diary by id", id],
        queryFn: () => diaryService.getById(id)
    })
}
import { diaryService } from "../../services/diaryService"
import { useAppQuery } from "../useAppQuery"

export const useDiaries = () => {
    return useAppQuery({
        queryKey: ["dairies"],
        queryFn: () => diaryService.getAll()
    })
}
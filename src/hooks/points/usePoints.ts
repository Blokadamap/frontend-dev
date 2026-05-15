import { pointService } from "../../services/pointService"
import { useAppQuery } from "../useAppQuery"

export const usePoints = () => {
    return useAppQuery({
        queryKey: ["points"],
        queryFn: () => pointService.getAll()
    })
}
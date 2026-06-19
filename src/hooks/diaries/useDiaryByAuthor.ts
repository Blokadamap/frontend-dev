import { diaryService } from "../../services/diaryService";
import { useAppQuery } from "../useAppQuery";

/** Дневник автора (публикация, место хранения, период ведения). */
export const useDiaryByAuthor = (authorId?: number) => {
  return useAppQuery({
    queryKey: ["diary by author", authorId],
    queryFn: () => diaryService.getByAuthor(authorId as number),
    enabled: authorId != null,
  });
};

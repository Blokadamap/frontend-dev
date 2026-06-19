import { useMemo } from "react";
import type { NoteListItem } from "../types/note/note.type";
import { useFilteredAuthorIds } from "./authors/useFilteredAuthorIds";
import { useFilteredNotes } from "./notes/useFilteredNotes";
import {
  buildAuthorParams,
  buildNoteParams,
  isAuthorAttrActive,
  isNoteFilterActive,
} from "../utils/serverFilters";
import type { ArchiveFiltersType } from "../store/archiveAtoms";

export interface ServerFilterResult {
  // null — ограничения нет (фильтры заметок/персоналии не активны).
  pointIdFilter: Set<number> | null;
  diaryIdFilter: Set<number> | null;
  // id свидетельств, прошедших фильтр (для карточки точки).
  noteIdFilter: Set<number> | null;
  // Сами свидетельства, прошедшие фильтр/поиск (для списка результатов).
  // null — серверная фильтрация не активна.
  notes: NoteListItem[] | null;
  isFiltering: boolean;
}

// Серверная фильтрация: по фильтрам персоналии получаем id авторов, затем
// по ним и фильтрам «Общее» — подходящие свидетельства (только их, не все).
// Возвращаем множества id точек и дневников для применения к карте/списку.
export function useServerFilter(
  filters: ArchiveFiltersType,
  search: string = "",
): ServerFilterResult {
  const searchQuery = search.trim();
  const searchActive = searchQuery.length > 0;
  const authorAttr = isAuthorAttrActive(filters);
  const hasAuthorId = filters.authorId != null;
  const noteActive = isNoteFilterActive(filters) || searchActive;

  const authorParams = buildAuthorParams(filters);
  const authorsQuery = useFilteredAuthorIds(authorParams, authorAttr);

  // Ограничение по авторам для запроса заметок.
  let authorIds: number[] | null = null;
  let authorPending = false;
  if (authorAttr) {
    if (authorsQuery.isSuccess && authorsQuery.data) {
      const attrIds = authorsQuery.data;
      authorIds = hasAuthorId
        ? attrIds.filter((id) => id === filters.authorId)
        : attrIds;
    } else {
      authorPending = true;
    }
  } else if (hasAuthorId) {
    authorIds = [filters.authorId as number];
  }

  const authorRestrict = authorIds !== null;
  const serverActive = noteActive || authorRestrict || authorAttr;
  const emptyByAuthor = authorRestrict && authorIds!.length === 0;

  const noteParams = buildNoteParams(filters, authorIds, searchQuery);
  const notesEnabled = serverActive && !authorPending && !emptyByAuthor;
  const notesQuery = useFilteredNotes(noteParams, notesEnabled);

  const notesData = notesQuery.data;
  const notesFetching = notesQuery.isFetching;

  return useMemo<ServerFilterResult>(() => {
    if (!serverActive) {
      return {
        pointIdFilter: null,
        diaryIdFilter: null,
        noteIdFilter: null,
        notes: null,
        isFiltering: false,
      };
    }
    if (emptyByAuthor) {
      return {
        pointIdFilter: new Set<number>(),
        diaryIdFilter: new Set<number>(),
        noteIdFilter: new Set<number>(),
        notes: [],
        isFiltering: false,
      };
    }
    if (!notesData) {
      // Ждём данные сервера — пока ничего не показываем.
      return {
        pointIdFilter: new Set<number>(),
        diaryIdFilter: new Set<number>(),
        noteIdFilter: new Set<number>(),
        notes: null,
        isFiltering: true,
      };
    }
    return {
      pointIdFilter: new Set<number>(notesData.flatMap((n) => n.pointIds)),
      diaryIdFilter: new Set<number>(notesData.map((n) => n.diaryId)),
      noteIdFilter: new Set<number>(notesData.map((n) => n.noteId)),
      notes: notesData,
      isFiltering: authorPending || notesFetching,
    };
  }, [serverActive, emptyByAuthor, authorPending, notesData, notesFetching]);
}

import { useState } from "react";
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Field, TextInput, TextArea, Select, MultiSelect, Status, apiErrorMessage } from "./fields";
import { useNoteFilters } from "../../hooks/notes/useNoteFilters";
import { useAuthors } from "../../hooks/authors/useAuthors";
import { usePoints } from "../../hooks/points/usePoints";
import { useCreateNote } from "../../hooks/notes/useCreateNote";
import { useUpdateNote } from "../../hooks/notes/useUpdateNote";
import { useCreateTag } from "../../hooks/notes/useCreateTag";
import type { NoteCreate, NoteToPointCreate } from "../../types/note/note.type";

const EMPTY: NoteCreate = {
  authorId: 0,
  noteTypeIds: [],
  temporalityIds: [],
  createdAt: "",
  citation: "",
  source: "",
  tagIds: [],
  noteToPoints: [],
};

type Props = {
  recordId?: number;
  initial?: NoteCreate;
  onSaved?: () => void;
};

export function NoteForm({ recordId, initial, onSaved }: Props) {
  const queryClient = useQueryClient();
  const { data: filters } = useNoteFilters();
  const { data: authors } = useAuthors();
  const { data: points } = usePoints();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const createTag = useCreateTag();
  const isEdit = recordId != null;

  const [form, setForm] = useState<NoteCreate>(initial ?? EMPTY);
  const [newTag, setNewTag] = useState("");

  const set = <K extends keyof NoteCreate>(key: K, value: NoteCreate[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const pending = createNote.isPending || updateNote.isPending;
  const isError = createNote.isError || updateNote.isError;
  const isSuccess = createNote.isSuccess || updateNote.isSuccess;

  const authorOptions = (authors ?? []).map((a) => ({
    id: a.authorId,
    name: [a.lastName, a.firstName, a.middleName].filter(Boolean).join(" "),
  }));
  const pointOptions = (points ?? []).map((p) => ({ id: p.pointId, name: p.name }));

  function addPointRow() {
    set("noteToPoints", [...form.noteToPoints, { pointId: 0, description: "" }]);
  }
  function updatePointRow(i: number, patch: Partial<NoteToPointCreate>) {
    set(
      "noteToPoints",
      form.noteToPoints.map((row, idx) => (idx === i ? { ...row, ...patch } : row)),
    );
  }
  function removePointRow(i: number) {
    set("noteToPoints", form.noteToPoints.filter((_, idx) => idx !== i));
  }

  // Поле «новый тег» одновременно фильтрует список тегов по введённым буквам.
  const tagQuery = newTag.trim().toLowerCase();
  const allTags = filters?.tags ?? [];
  const filteredTags = tagQuery
    ? allTags.filter((t) => t.name.toLowerCase().includes(tagQuery))
    : allTags;
  const exactTag = allTags.find((t) => t.name.toLowerCase() === tagQuery);

  function handleAddTag() {
    const name = newTag.trim();
    if (!name || exactTag) return; // дубликаты не создаём — такой тег уже есть
    createTag.mutate(
      { name },
      {
        onSuccess: (data) => {
          const created = data as { tag_id?: number };
          // Сразу выделяем созданный тег в свидетельстве.
          if (created?.tag_id && !form.tagIds.includes(created.tag_id)) {
            set("tagIds", [...form.tagIds, created.tag_id]);
          }
          setNewTag("");
          queryClient.invalidateQueries({ queryKey: ["note filtes"] });
        },
      },
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload: NoteCreate = {
      ...form,
      noteToPoints: form.noteToPoints.filter((r) => r.pointId),
    };
    if (isEdit) {
      updateNote.mutate({ id: recordId, data: payload }, { onSuccess: () => onSaved?.() });
    } else {
      createNote.mutate(payload, { onSuccess: () => setForm(EMPTY) });
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-grid">
        <Field label="Автор" required>
          <Select
            options={authorOptions}
            value={form.authorId || ""}
            onChange={(e) => set("authorId", Number(e.target.value))}
          />
        </Field>
        <Field label="Дата свидетельства" required>
          <input
            className="admin-input"
            type="date"
            value={form.createdAt}
            onChange={(e) => set("createdAt", e.target.value)}
            required
          />
        </Field>
        <Field label="Тип свидетельства" required>
          <MultiSelect
            options={filters?.noteTypes ?? []}
            value={form.noteTypeIds}
            onChange={(v) => set("noteTypeIds", v)}
          />
        </Field>
        <Field label="Темпоральность" required>
          <MultiSelect
            options={filters?.temporalities ?? []}
            value={form.temporalityIds}
            onChange={(v) => set("temporalityIds", v)}
          />
        </Field>
      </div>

      <Field label="Цитата" required full>
        <TextArea value={form.citation} onChange={(e) => set("citation", e.target.value)} required />
      </Field>
      <Field label="Источник" full>
        <TextInput
          value={form.source}
          onChange={(e) => set("source", e.target.value)}
          placeholder="Архив, фонд, страница…"
        />
      </Field>

      <Field label="Теги" full>
        <MultiSelect
          options={filteredTags}
          value={form.tagIds}
          onChange={(v) => set("tagIds", v)}
          emptyText="Нет тегов с таким сочетанием — можно создать новый"
        />
      </Field>
      <div className="admin-actions">
        <input
          className="admin-input"
          style={{ maxWidth: 260 }}
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Поиск тега или новый тег…"
        />
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={handleAddTag}
          disabled={createTag.isPending || !tagQuery || !!exactTag}
        >
          {createTag.isPending ? "Создаём…" : "Создать тег"}
        </button>
      </div>
      {exactTag && (
        <p className="admin-content__hint" style={{ margin: "-4px 0 0" }}>
          Тег «{exactTag.name}» уже есть — выберите его в списке выше.
        </p>
      )}
      {createTag.isError && (
        <Status kind="err">{apiErrorMessage(createTag.error, "Не удалось создать тег.")}</Status>
      )}

      <Field label="Привязка к местам" full>
        <div className="admin-repeater">
          {form.noteToPoints.map((row, i) => (
            <div className="admin-repeater__row" key={i}>
              <select
                className="admin-select"
                value={row.pointId || ""}
                onChange={(e) => updatePointRow(i, { pointId: Number(e.target.value) })}
              >
                <option value="">— место —</option>
                {pointOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                className="admin-input"
                value={row.description}
                onChange={(e) => updatePointRow(i, { description: e.target.value })}
                placeholder="Описание привязки"
              />
              <button type="button" className="admin-iconbtn" onClick={() => removePointRow(i)} title="Удалить">
                ×
              </button>
            </div>
          ))}
          <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={addPointRow}>
            + Добавить место
          </button>
        </div>
      </Field>

      {isError && (
        <Status kind="err">
          {apiErrorMessage(
            createNote.error ?? updateNote.error,
            "Не удалось сохранить свидетельство. Проверьте поля.",
          )}
        </Status>
      )}
      {isSuccess && <Status kind="ok">{isEdit ? "Изменения сохранены." : "Свидетельство добавлено."}</Status>}

      <div className="admin-actions">
        <button className="admin-btn" type="submit" disabled={pending}>
          {pending ? "Сохраняем…" : isEdit ? "Сохранить изменения" : "Добавить свидетельство"}
        </button>
        {isEdit ? (
          <button className="admin-btn admin-btn--ghost" type="button" onClick={() => onSaved?.()}>
            Отмена
          </button>
        ) : (
          <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setForm(EMPTY)}>
            Очистить
          </button>
        )}
      </div>
    </form>
  );
}

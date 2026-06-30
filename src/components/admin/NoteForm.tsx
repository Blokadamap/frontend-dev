import { useState } from "react";
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";

import { Field, TextInput, TextArea, Select, MultiSelect, Status, apiErrorMessage } from "./fields";
import { useNoteFilters } from "../../hooks/notes/useNoteFilters";
import { useAuthors } from "../../hooks/authors/useAuthors";
import { usePoints } from "../../hooks/points/usePoints";
import { useCreateNote } from "../../hooks/notes/useCreateNote";
import { useUpdateNote } from "../../hooks/notes/useUpdateNote";
import { useCreateTag } from "../../hooks/notes/useCreateTag";
import { useCreateNoteTaxonomy } from "../../hooks/notes/useCreateNoteTaxonomy";
import type { NoteCreate, NoteToPointCreate } from "../../types/note/note.type";
import type { FilterItem, TagCreate } from "../../types/common/common.types";

// Фиксированные варианты для одиночного выбора (храним строку как есть).
const LOCALIZATION_ACCURACY_OPTIONS = ["Эллипсис", "Точное место"];
const PLACE_TYPE_OPTIONS = [
  "Место жительства",
  "Место работы",
  "Место жительства, работы, учебы близких, родных, знакомых автора",
  "Другое",
];

const EMPTY: NoteCreate = {
  authorId: 0,
  noteTypeIds: [],
  temporalityIds: [],
  createdAt: "",
  citation: "",
  source: "",
  tagIds: [],
  noteToPoints: [],
  localizationAccuracy: null,
  placeType: null,
  organizationIds: [],
  cityNameIds: [],
  geoNameIds: [],
  personalityIds: [],
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
  // Хуки создания новых тегоподобных справочников (по одному на справочник).
  const createOrganization = useCreateNoteTaxonomy("organizations");
  const createCityName = useCreateNoteTaxonomy("city-names");
  const createGeoName = useCreateNoteTaxonomy("geo-names");
  const createPersonality = useCreateNoteTaxonomy("personalities");
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
        <Field label="Точность локализации">
          <select
            className="admin-select"
            value={form.localizationAccuracy ?? ""}
            onChange={(e) => set("localizationAccuracy", e.target.value || null)}
          >
            <option value="">— не указано —</option>
            {LOCALIZATION_ACCURACY_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Тип места">
          <select
            className="admin-select"
            value={form.placeType ?? ""}
            onChange={(e) => set("placeType", e.target.value || null)}
          >
            <option value="">— не указано —</option>
            {PLACE_TYPE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
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

      <TaxonomyField
        label="Упоминание/связанные организации"
        addLabel="организацию"
        options={filters?.organizations ?? []}
        value={form.organizationIds}
        onChange={(v) => set("organizationIds", v)}
        createMutation={createOrganization}
      />
      <TaxonomyField
        label="Упоминание городских названий"
        addLabel="название"
        options={filters?.cityNames ?? []}
        value={form.cityNameIds}
        onChange={(v) => set("cityNameIds", v)}
        createMutation={createCityName}
      />
      <TaxonomyField
        label="Упоминание географических названий"
        addLabel="название"
        options={filters?.geoNames ?? []}
        value={form.geoNameIds}
        onChange={(v) => set("geoNameIds", v)}
        createMutation={createGeoName}
      />
      <TaxonomyField
        label="Упоминание персоналий"
        addLabel="персоналию"
        options={filters?.personalities ?? []}
        value={form.personalityIds}
        onChange={(v) => set("personalityIds", v)}
        createMutation={createPersonality}
      />

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

// Достаёт числовой id из ответа создания справочника. У разных таблиц поле
// называется по-своему (organization_id, city_name_id…), поэтому берём
// первое значение-число по ключу, оканчивающемуся на «_id».
function extractId(obj: unknown): number | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (key.endsWith("_id") && typeof value === "number") return value;
  }
  return undefined;
}

type TaxonomyFieldProps = {
  label: string;
  addLabel: string; // во фразе «Создать <addLabel>»
  options: FilterItem[];
  value: number[];
  onChange: (next: number[]) => void;
  createMutation: UseMutationResult<unknown, Error, TagCreate, unknown>;
};

// Тегоподобное поле свидетельства: мультивыбор из справочника + создание
// нового значения. Полностью повторяет поведение блока «Теги».
function TaxonomyField({ label, addLabel, options, value, onChange, createMutation }: TaxonomyFieldProps) {
  const [draft, setDraft] = useState("");
  const query = draft.trim().toLowerCase();
  const filtered = query
    ? options.filter((o) => o.name.toLowerCase().includes(query))
    : options;
  const exact = options.find((o) => o.name.toLowerCase() === query);

  function handleAdd() {
    const name = draft.trim();
    if (!name || exact) return; // дубликаты не создаём
    createMutation.mutate(
      { name },
      {
        onSuccess: (data) => {
          const id = extractId(data);
          if (id && !value.includes(id)) onChange([...value, id]);
          setDraft("");
        },
      },
    );
  }

  return (
    <>
      <Field label={label} full>
        <MultiSelect
          options={filtered}
          value={value}
          onChange={onChange}
          emptyText="Нет значений с таким сочетанием — можно создать новое"
        />
      </Field>
      <div className="admin-actions">
        <input
          className="admin-input"
          style={{ maxWidth: 260 }}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Поиск или новое значение…"
        />
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={handleAdd}
          disabled={createMutation.isPending || !query || !!exact}
        >
          {createMutation.isPending ? "Создаём…" : `Создать ${addLabel}`}
        </button>
      </div>
      {exact && (
        <p className="admin-content__hint" style={{ margin: "-4px 0 0" }}>
          «{exact.name}» уже есть — выберите в списке выше.
        </p>
      )}
      {createMutation.isError && (
        <Status kind="err">{apiErrorMessage(createMutation.error, "Не удалось создать значение.")}</Status>
      )}
    </>
  );
}

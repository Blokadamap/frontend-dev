import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { Field, TextInput, TextArea, Select, MultiSelect, Status, apiErrorMessage } from "./fields";
import { useAuthorFilters } from "../../hooks/authors/useAuthorFilters";
import { useCreateAuthor } from "../../hooks/authors/useCreateAuthor";
import { useUpdateAuthor } from "../../hooks/authors/useUpdateAuthor";
import { fileToCompressedDataUrl } from "../../utils/imageToDataUrl";
import type { AuthorCreate } from "../../types/author/author.type";

const EMPTY: AuthorCreate = {
  lastName: "",
  firstName: "",
  middleName: "",
  sex: "M",
  birthDate: "",
  deathDate: "",
  biography: "",
  photo: "",
  hasChildren: false,
  familyStatusId: 0,
  socialClassIds: [],
  nationalityIds: [],
  religionIds: [],
  educationIds: [],
  occupationIds: [],
  politicalPartyIds: [],
  cardIds: [],
  diaryStartedAt: "",
  diaryFinishedAt: "",
  diarySource: "",
  diaryStoragePlace: "",
};

type Props = {
  /** id редактируемого автора; если не задан — режим добавления. */
  recordId?: number;
  initial?: AuthorCreate;
  onSaved?: () => void;
};

export function AuthorForm({ recordId, initial, onSaved }: Props) {
  const { data: filters } = useAuthorFilters();
  const createAuthor = useCreateAuthor();
  const updateAuthor = useUpdateAuthor();
  const isEdit = recordId != null;
  const [form, setForm] = useState<AuthorCreate>(initial ?? EMPTY);

  const set = <K extends keyof AuthorCreate>(key: K, value: AuthorCreate[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const [photoError, setPhotoError] = useState<string | null>(null);

  async function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhotoError(null);
      const dataUrl = await fileToCompressedDataUrl(file);
      set("photo", dataUrl);
    } catch {
      setPhotoError("Не удалось обработать изображение");
    } finally {
      e.target.value = "";
    }
  }

  const pending = createAuthor.isPending || updateAuthor.isPending;
  const isError = createAuthor.isError || updateAuthor.isError;
  const isSuccess = createAuthor.isSuccess || updateAuthor.isSuccess;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isEdit) {
      updateAuthor.mutate({ id: recordId, data: form }, { onSuccess: () => onSaved?.() });
    } else {
      createAuthor.mutate(form, { onSuccess: () => setForm(EMPTY) });
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-grid">
        <Field label="Фамилия" required>
          <TextInput value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
        </Field>
        <Field label="Имя">
          <TextInput value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
        </Field>
        <Field label="Отчество">
          <TextInput value={form.middleName} onChange={(e) => set("middleName", e.target.value)} />
        </Field>
        <Field label="Пол">
          <select
            className="admin-select"
            value={form.sex}
            onChange={(e) => set("sex", e.target.value as "M" | "F")}
          >
            <option value="M">Мужской</option>
            <option value="F">Женский</option>
          </select>
        </Field>
        <Field label="Дата рождения">
          <input
            className="admin-input"
            type="date"
            value={form.birthDate}
            onChange={(e) => set("birthDate", e.target.value)}
          />
        </Field>
        <Field label="Дата смерти">
          <input
            className="admin-input"
            type="date"
            value={form.deathDate}
            onChange={(e) => set("deathDate", e.target.value)}
          />
        </Field>
        <Field label="Семейное положение">
          <Select
            options={filters?.familyStatuses ?? []}
            value={form.familyStatusId || ""}
            onChange={(e) => set("familyStatusId", Number(e.target.value))}
          />
        </Field>
      </div>

      <Field label="Биография" full>
        <TextArea value={form.biography} onChange={(e) => set("biography", e.target.value)} />
      </Field>

      <Field label="Фотография" full>
        <div className="admin-photo">
          {form.photo ? (
            <div className="admin-photo__preview">
              <img src={form.photo} alt="Фотография автора" />
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => set("photo", "")}
              >
                Удалить фото
              </button>
            </div>
          ) : (
            <span className="admin-photo__empty">Фото не загружено</span>
          )}
          <input type="file" accept="image/*" onChange={handlePhoto} />
          {photoError && <Status kind="err">{photoError}</Status>}
        </div>
      </Field>

      <label className="admin-field admin-checkbox">
        <input
          type="checkbox"
          checked={form.hasChildren}
          onChange={(e) => set("hasChildren", e.target.checked)}
        />
        <span>Есть дети</span>
      </label>

      <Field label="Социальное происхождение" full>
        <MultiSelect
          options={filters?.socialClasses ?? []}
          value={form.socialClassIds}
          onChange={(v) => set("socialClassIds", v)}
        />
      </Field>
      <Field label="Национальность" full>
        <MultiSelect
          options={filters?.nationalities ?? []}
          value={form.nationalityIds}
          onChange={(v) => set("nationalityIds", v)}
        />
      </Field>
      <Field label="Религиозная идентификация" full>
        <MultiSelect
          options={filters?.religions ?? []}
          value={form.religionIds}
          onChange={(v) => set("religionIds", v)}
        />
      </Field>
      <Field label="Образование" full>
        <MultiSelect
          options={filters?.educations ?? []}
          value={form.educationIds}
          onChange={(v) => set("educationIds", v)}
        />
      </Field>
      <Field label="Тип деятельности" full>
        <MultiSelect
          options={filters?.occupations ?? []}
          value={form.occupationIds}
          onChange={(v) => set("occupationIds", v)}
        />
      </Field>
      <Field label="Партийность" full>
        <MultiSelect
          options={filters?.politicalParties ?? []}
          value={form.politicalPartyIds}
          onChange={(v) => set("politicalPartyIds", v)}
        />
      </Field>
      <Field label="Тип карточки" full>
        <MultiSelect
          options={filters?.cards ?? []}
          value={form.cardIds}
          onChange={(v) => set("cardIds", v)}
        />
      </Field>

      <div className="admin-grid">
        <Field label="Дневник: начало">
          <input
            className="admin-input"
            type="date"
            value={form.diaryStartedAt}
            onChange={(e) => set("diaryStartedAt", e.target.value)}
          />
        </Field>
        <Field label="Дневник: окончание">
          <input
            className="admin-input"
            type="date"
            value={form.diaryFinishedAt}
            onChange={(e) => set("diaryFinishedAt", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Публикация дневника" full>
        <TextInput
          value={form.diarySource}
          onChange={(e) => set("diarySource", e.target.value)}
          placeholder="Издание, сборник, публикация…"
        />
      </Field>
      <Field label="Место хранения дневника" full>
        <TextInput
          value={form.diaryStoragePlace}
          onChange={(e) => set("diaryStoragePlace", e.target.value)}
          placeholder="Архив, фонд, опись, дело…"
        />
      </Field>

      {isError && (
        <Status kind="err">
          {apiErrorMessage(
            createAuthor.error ?? updateAuthor.error,
            "Не удалось сохранить автора. Проверьте поля.",
          )}
        </Status>
      )}
      {isSuccess && <Status kind="ok">{isEdit ? "Изменения сохранены." : "Автор добавлен."}</Status>}

      <div className="admin-actions">
        <button className="admin-btn" type="submit" disabled={pending}>
          {pending ? "Сохраняем…" : isEdit ? "Сохранить изменения" : "Добавить автора"}
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

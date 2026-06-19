import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { Field, TextInput, TextArea, Status, apiErrorMessage } from "./fields";
import { usePointTypes } from "../../hooks/points/usePointTypes";
import { useRayons } from "../../hooks/points/useRayons";
import { useCreatePoint } from "../../hooks/points/useCreatePoint";
import { useUpdatePoint } from "../../hooks/points/useUpdatePoint";
import type { PointCreate } from "../../types/point/point.type";
import {
  PLACE_KIND_LABELS,
  kindOfTypeName,
  typesForKind,
  type PlaceKind,
} from "../../utils/placeKind";

type FormState = {
  rayonId: number;
  street: string;
  building: string;
  latitude: string;
  longitude: string;
  placeKind: PlaceKind | "";
  pointTypeId: number;
  pointSubtypeId: number;
  pointSubsubtypeId: number;
  name: string;
  description: string;
};

const EMPTY: FormState = {
  rayonId: 0,
  street: "",
  building: "",
  latitude: "",
  longitude: "",
  placeKind: "",
  pointTypeId: 0,
  pointSubtypeId: 0,
  pointSubsubtypeId: 0,
  name: "",
  description: "",
};

function toState(p?: PointCreate): FormState {
  if (!p) return EMPTY;
  return {
    rayonId: p.rayonId ?? 0,
    street: p.street ?? "",
    building: p.building ?? "",
    latitude: p.latitude != null ? String(p.latitude) : "",
    longitude: p.longitude != null ? String(p.longitude) : "",
    placeKind: "", // выводится из pointTypeId после загрузки справочника
    pointTypeId: p.pointTypeId ?? 0,
    pointSubtypeId: p.pointSubtypeId ?? 0,
    pointSubsubtypeId: p.pointSubsubtypeId ?? 0,
    name: p.name ?? "",
    description: p.description ?? "",
  };
}

type Props = {
  recordId?: number;
  initial?: PointCreate;
  onSaved?: () => void;
};

export function PointForm({ recordId, initial, onSaved }: Props) {
  const { data: rayons } = useRayons();
  const { data: types } = usePointTypes();
  const createPoint = useCreatePoint();
  const updatePoint = useUpdatePoint();
  const isEdit = recordId != null;
  const [form, setForm] = useState<FormState>(() => toState(initial));

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // «Тип места» (Здание/Другое). При редактировании группа не хранится, а
  // выводится из сохранённого подтипа (point_type) — без отдельного эффекта.
  const placeKind: PlaceKind | "" = useMemo(() => {
    if (form.placeKind) return form.placeKind;
    if (!form.pointTypeId || !types) return "";
    const name = types.find((t) => t.pointTypeId === form.pointTypeId)?.name;
    return name ? kindOfTypeName(name) : "";
  }, [form.placeKind, form.pointTypeId, types]);

  // «Подтип» (point_type) — отфильтрован по выбранной группе «Тип места».
  const typeOptions = useMemo(
    () => typesForKind(types, placeKind),
    [types, placeKind],
  );
  const subtypes = useMemo(
    () =>
      types?.find((t) => t.pointTypeId === form.pointTypeId)?.pointSubtypes ??
      [],
    [types, form.pointTypeId],
  );
  const subsubtypes = useMemo(
    () =>
      subtypes.find((s) => s.pointSubtypeId === form.pointSubtypeId)
        ?.pointSubsubtypes ?? [],
    [subtypes, form.pointSubtypeId],
  );

  const pending = createPoint.isPending || updatePoint.isPending;
  const isError = createPoint.isError || updatePoint.isError;
  const isSuccess = createPoint.isSuccess || updatePoint.isSuccess;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload: PointCreate = {
      rayonId: form.rayonId || null,
      street: form.street,
      building: form.building,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      pointTypeId: form.pointTypeId,
      pointSubtypeId: form.pointSubtypeId || null,
      pointSubsubtypeId: form.pointSubsubtypeId || null,
      name: form.name,
      description: form.description || null,
    };
    if (isEdit) {
      updatePoint.mutate(
        { id: recordId, data: payload },
        { onSuccess: () => onSaved?.() },
      );
    } else {
      createPoint.mutate(payload, { onSuccess: () => setForm(EMPTY) });
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <Field label="Название места" required full>
        <TextInput
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
        />
      </Field>

      <div className="admin-grid">
        <Field label="Район">
          <select
            className="admin-select"
            value={form.rayonId || ""}
            onChange={(e) => set("rayonId", Number(e.target.value))}
          >
            <option value="">— выберите —</option>
            {(rayons ?? []).map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Тип места">
          <select
            className="admin-select"
            value={placeKind}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                placeKind: e.target.value as PlaceKind | "",
                pointTypeId: 0,
                pointSubtypeId: 0,
                pointSubsubtypeId: 0,
              }))
            }
          >
            <option value="">— выберите —</option>
            <option value="building">{PLACE_KIND_LABELS.building}</option>
            <option value="other">{PLACE_KIND_LABELS.other}</option>
          </select>
        </Field>

        <Field label="Подтип">
          <select
            className="admin-select"
            value={form.pointTypeId || ""}
            disabled={!placeKind}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                pointTypeId: Number(e.target.value),
                pointSubtypeId: 0,
                pointSubsubtypeId: 0,
              }))
            }
          >
            <option value="">— выберите —</option>
            {typeOptions.map((t) => (
              <option key={t.pointTypeId} value={t.pointTypeId}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Тип учреждения/предприятия">
          <select
            className="admin-select"
            value={form.pointSubtypeId || ""}
            disabled={!subtypes.length}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                pointSubtypeId: Number(e.target.value),
                pointSubsubtypeId: 0,
              }))
            }
          >
            <option value="">— нет —</option>
            {subtypes.map((s) => (
              <option key={s.pointSubtypeId} value={s.pointSubtypeId}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Подтип учреждения/предприятия">
          <select
            className="admin-select"
            value={form.pointSubsubtypeId || ""}
            disabled={!subsubtypes.length}
            onChange={(e) => set("pointSubsubtypeId", Number(e.target.value))}
          >
            <option value="">— нет —</option>
            {subsubtypes.map((s) => (
              <option key={s.pointSubsubtypeId} value={s.pointSubsubtypeId}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Улица">
          <TextInput
            value={form.street}
            onChange={(e) => set("street", e.target.value)}
          />
        </Field>
        <Field label="Дом">
          <TextInput
            value={form.building}
            onChange={(e) => set("building", e.target.value)}
          />
        </Field>
        <Field label="Широта (latitude)">
          <input
            className="admin-input"
            type="number"
            step="any"
            value={form.latitude}
            onChange={(e) => set("latitude", e.target.value)}
            placeholder="59.9343"
          />
        </Field>
        <Field label="Долгота (longitude)">
          <input
            className="admin-input"
            type="number"
            step="any"
            value={form.longitude}
            onChange={(e) => set("longitude", e.target.value)}
            placeholder="30.3351"
          />
        </Field>
      </div>

      <Field label="Описание" full>
        <TextArea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      {isError && (
        <Status kind="err">
          {apiErrorMessage(
            createPoint.error ?? updatePoint.error,
            "Не удалось сохранить место. Проверьте поля.",
          )}
        </Status>
      )}
      {isSuccess && (
        <Status kind="ok">
          {isEdit ? "Изменения сохранены." : "Место добавлено."}
        </Status>
      )}

      <div className="admin-actions">
        <button className="admin-btn" type="submit" disabled={pending}>
          {pending ? "Сохраняем…" : isEdit ? "Сохранить изменения" : "Добавить место"}
        </button>
        {isEdit ? (
          <button
            className="admin-btn admin-btn--ghost"
            type="button"
            onClick={() => onSaved?.()}
          >
            Отмена
          </button>
        ) : (
          <button
            className="admin-btn admin-btn--ghost"
            type="button"
            onClick={() => setForm(EMPTY)}
          >
            Очистить
          </button>
        )}
      </div>
    </form>
  );
}

import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { NoteForm } from "./NoteForm";
import { AuthorForm } from "./AuthorForm";
import { PointForm } from "./PointForm";
import { Status } from "./fields";

import { useAuthors } from "../../hooks/authors/useAuthors";
import { usePoints } from "../../hooks/points/usePoints";
import { useAllNotes } from "../../hooks/notes/useAllNotes";
import { useNoteFilters } from "../../hooks/notes/useNoteFilters";
import { useDeleteNote } from "../../hooks/notes/useDeleteNote";
import { useDeleteAuthor } from "../../hooks/authors/useDeleteAuthor";
import { useDeletePoint } from "../../hooks/points/useDeletePoint";
import { useDeleteTag } from "../../hooks/notes/useDeleteTag";
import { useDeleteNoteTaxonomy } from "../../hooks/notes/useDeleteNoteTaxonomy";
import type { FilterItem } from "../../types/common/common.types";
import type { NoteFilters } from "../../types/note/note.type";

import { authorService } from "../../services/authorService";
import { pointService } from "../../services/pointService";
import { noteService } from "../../services/noteService";
import { diaryService } from "../../services/diaryService";

import type { AuthorCreate } from "../../types/author/author.type";
import type { PointCreate } from "../../types/point/point.type";

type Entity =
  | "notes"
  | "authors"
  | "points"
  | "tags"
  | "organizations"
  | "city-names"
  | "geo-names"
  | "personalities";

const ENTITY_TABS: { id: Entity; label: string }[] = [
  { id: "notes", label: "Свидетельства" },
  { id: "authors", label: "Авторы" },
  { id: "points", label: "Места" },
  { id: "tags", label: "Теги" },
  { id: "organizations", label: "Организации" },
  { id: "city-names", label: "Городские названия" },
  { id: "geo-names", label: "Географические названия" },
  { id: "personalities", label: "Персоналии" },
];

const DELETE_LABEL: Record<Entity, string> = {
  notes: "свидетельство",
  authors: "автора",
  points: "место",
  tags: "тег",
  organizations: "организацию",
  "city-names": "городское название",
  "geo-names": "географическое название",
  personalities: "персоналию",
};

// Какое поле справочника из useNoteFilters показывать на вкладке.
const TAXONOMY_FILTER_KEY: Partial<Record<Entity, keyof NoteFilters>> = {
  organizations: "organizations",
  "city-names": "cityNames",
  "geo-names": "geoNames",
  personalities: "personalities",
};

export function RecordsPanel() {
  const queryClient = useQueryClient();
  const [entity, setEntity] = useState<Entity>("notes");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const deleteNote = useDeleteNote();
  const deleteAuthor = useDeleteAuthor();
  const deletePoint = useDeletePoint();
  const deleteTag = useDeleteTag();
  const deleteOrganization = useDeleteNoteTaxonomy("organizations");
  const deleteCityName = useDeleteNoteTaxonomy("city-names");
  const deleteGeoName = useDeleteNoteTaxonomy("geo-names");
  const deletePersonality = useDeleteNoteTaxonomy("personalities");

  function refreshLists() {
    queryClient.invalidateQueries({ queryKey: ["authors"] });
    queryClient.invalidateQueries({ queryKey: ["points"] });
    queryClient.invalidateQueries({ queryKey: ["all notes"] });
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    queryClient.invalidateQueries({ queryKey: ["note filtes"] });
  }

  function openEdit(id: number) {
    setError("");
    setEditingId(id);
  }
  function closeEdit() {
    setEditingId(null);
    refreshLists();
  }

  function switchEntity(e: Entity) {
    setEntity(e);
    setEditingId(null);
    setSearch("");
    setError("");
  }

  function handleDelete(id: number) {
    if (!window.confirm(`Удалить ${DELETE_LABEL[entity]}? Действие необратимо.`)) return;
    setError("");
    const opts = {
      onSuccess: () => refreshLists(),
      onError: (e: unknown) => {
        const detail = e instanceof AxiosError ? e.response?.data?.detail : undefined;
        setError(typeof detail === "string" ? detail : "Не удалось удалить запись.");
      },
    };
    if (entity === "notes") deleteNote.mutate(id, opts);
    else if (entity === "authors") deleteAuthor.mutate(id, opts);
    else if (entity === "points") deletePoint.mutate(id, opts);
    else if (entity === "tags") deleteTag.mutate(id, opts);
    else if (entity === "organizations") deleteOrganization.mutate(id, opts);
    else if (entity === "city-names") deleteCityName.mutate(id, opts);
    else if (entity === "geo-names") deleteGeoName.mutate(id, opts);
    else deletePersonality.mutate(id, opts);
  }

  return (
    <div>
      <div className="admin-subnav">
        {ENTITY_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-pill${entity === t.id ? " admin-pill--on" : ""}`}
            onClick={() => switchEntity(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {editingId != null ? (
        <div>
          <button className="admin-btn admin-btn--ghost admin-btn--sm" type="button" onClick={closeEdit}>
            ← К списку
          </button>
          <div style={{ marginTop: 16 }}>
            {entity === "notes" && <NoteEditLoader id={editingId} onSaved={closeEdit} />}
            {entity === "authors" && <AuthorEditLoader id={editingId} onSaved={closeEdit} />}
            {entity === "points" && <PointEditLoader id={editingId} onSaved={closeEdit} />}
          </div>
        </div>
      ) : (
        <>
          <input
            className="admin-input"
            style={{ maxWidth: 360, marginBottom: 16 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск…"
          />
          {error && (
            <div style={{ marginBottom: 12 }}>
              <Status kind="err">{error}</Status>
            </div>
          )}
          {entity === "notes" && <NotesList search={search} onEdit={openEdit} onDelete={handleDelete} />}
          {entity === "authors" && <AuthorsList search={search} onEdit={openEdit} onDelete={handleDelete} />}
          {entity === "points" && <PointsList search={search} onEdit={openEdit} onDelete={handleDelete} />}
          {entity === "tags" && <TagsList search={search} onDelete={handleDelete} />}
          {TAXONOMY_FILTER_KEY[entity] && (
            <TaxonomyList
              filterKey={TAXONOMY_FILTER_KEY[entity]!}
              search={search}
              onDelete={handleDelete}
            />
          )}
        </>
      )}
    </div>
  );
}

/* ----------------------------- Списки ----------------------------- */

type RowProps = { title: string; subtitle?: string; onEdit?: () => void; onDelete: () => void };

function RecordRow({ title, subtitle, onEdit, onDelete }: RowProps) {
  return (
    <div className="admin-record">
      <div className="admin-record__text">
        <div className="admin-record__title">{title}</div>
        {subtitle && <div className="admin-record__sub">{subtitle}</div>}
      </div>
      <div className="admin-record__actions">
        {onEdit && (
          <button className="admin-btn admin-btn--ghost admin-btn--sm" type="button" onClick={onEdit}>
            Редактировать
          </button>
        )}
        <button className="admin-btn admin-btn--danger admin-btn--sm" type="button" onClick={onDelete}>
          Удалить
        </button>
      </div>
    </div>
  );
}

function TagsList({ search, onDelete }: { search: string; onDelete: (id: number) => void }) {
  const { data, isLoading } = useNoteFilters();
  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.tags ?? []).filter((t) => t.name.toLowerCase().includes(q));
  }, [data, search]);

  if (isLoading) return <div className="admin-empty">Загрузка…</div>;
  if (!items.length) return <div className="admin-empty">Ничего не найдено.</div>;
  return (
    <div className="admin-records">
      {items.map((t) => (
        <RecordRow key={t.id} title={t.name} subtitle={`ID ${t.id}`} onDelete={() => onDelete(t.id)} />
      ))}
    </div>
  );
}

// Список значений нового тегоподобного справочника (организации, городские/
// географические названия, персоналии) с удалением — аналогично TagsList.
function TaxonomyList({
  filterKey,
  search,
  onDelete,
}: {
  filterKey: keyof NoteFilters;
  search: string;
  onDelete: (id: number) => void;
}) {
  const { data, isLoading } = useNoteFilters();
  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (data?.[filterKey] as FilterItem[] | undefined) ?? [];
    return list.filter((t) => t.name.toLowerCase().includes(q));
  }, [data, filterKey, search]);

  if (isLoading) return <div className="admin-empty">Загрузка…</div>;
  if (!items.length) return <div className="admin-empty">Ничего не найдено.</div>;
  return (
    <div className="admin-records">
      {items.map((t) => (
        <RecordRow key={t.id} title={t.name} subtitle={`ID ${t.id}`} onDelete={() => onDelete(t.id)} />
      ))}
    </div>
  );
}

type ListProps = { search: string; onEdit: (id: number) => void; onDelete: (id: number) => void };

function AuthorsList({ search, onEdit, onDelete }: ListProps) {
  const { data, isLoading } = useAuthors();
  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((a) =>
      [a.lastName, a.firstName, a.middleName].filter(Boolean).join(" ").toLowerCase().includes(q),
    );
  }, [data, search]);

  if (isLoading) return <div className="admin-empty">Загрузка…</div>;
  if (!items.length) return <div className="admin-empty">Ничего не найдено.</div>;
  return (
    <div className="admin-records">
      {items.map((a) => (
        <RecordRow
          key={a.authorId}
          title={[a.lastName, a.firstName, a.middleName].filter(Boolean).join(" ")}
          subtitle={`ID ${a.authorId}`}
          onEdit={() => onEdit(a.authorId)}
          onDelete={() => onDelete(a.authorId)}
        />
      ))}
    </div>
  );
}

function PointsList({ search, onEdit, onDelete }: ListProps) {
  const { data, isLoading } = usePoints();
  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((p) => p.name.toLowerCase().includes(q));
  }, [data, search]);

  if (isLoading) return <div className="admin-empty">Загрузка…</div>;
  if (!items.length) return <div className="admin-empty">Ничего не найдено.</div>;
  return (
    <div className="admin-records">
      {items.map((p) => (
        <RecordRow
          key={p.pointId}
          title={p.name}
          subtitle={[p.street, p.building].filter(Boolean).join(", ") || `ID ${p.pointId}`}
          onEdit={() => onEdit(p.pointId)}
          onDelete={() => onDelete(p.pointId)}
        />
      ))}
    </div>
  );
}

function NotesList({ search, onEdit, onDelete }: ListProps) {
  const { data: notes, isLoading } = useAllNotes();
  const { data: authors } = useAuthors();

  const authorName = (id: number) => {
    const a = (authors ?? []).find((x) => x.authorId === id);
    return a ? [a.lastName, a.firstName, a.middleName].filter(Boolean).join(" ") : `Автор #${id}`;
  };

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (notes ?? []).filter((n) => {
      const hay = `${authorName(n.authorId)} ${n.createdAt} ${n.noteTypes.map((t) => t.name).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, authors, search]);

  if (isLoading) return <div className="admin-empty">Загрузка…</div>;
  if (!items.length) return <div className="admin-empty">Ничего не найдено.</div>;
  return (
    <div className="admin-records">
      {items.map((n) => (
        <RecordRow
          key={n.noteId}
          title={`${authorName(n.authorId)} — ${n.createdAt}`}
          subtitle={`${n.noteTypes.map((t) => t.name).join(", ") || "свидетельство"} · ID ${n.noteId}`}
          onEdit={() => onEdit(n.noteId)}
          onDelete={() => onDelete(n.noteId)}
        />
      ))}
    </div>
  );
}

/* --------------------------- Загрузчики --------------------------- */

function AuthorEditLoader({ id, onSaved }: { id: number; onSaved: () => void }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["author edit", id],
    queryFn: async (): Promise<AuthorCreate> => {
      const [a, diary] = await Promise.all([
        authorService.getById(String(id)),
        diaryService.getByAuthor(id),
      ]);
      return {
        lastName: a.lastName,
        firstName: a.firstName,
        middleName: a.middleName ?? "",
        sex: a.sex,
        birthDate: a.birthDate,
        deathDate: a.deathDate ?? "",
        biography: a.biography,
        photo: a.photo ?? "",
        hasChildren: a.hasChildren,
        familyStatusId: a.familyStatusId,
        socialClassIds: (a.socialClasses ?? []).map((x) => x.id),
        nationalityIds: (a.nationalities ?? []).map((x) => x.id),
        religionIds: (a.religions ?? []).map((x) => x.id),
        educationIds: (a.education ?? []).map((x) => x.id),
        occupationIds: (a.occupation ?? []).map((x) => x.id),
        politicalPartyIds: (a.politicalParties ?? []).map((x) => x.id),
        cardIds: (a.cards ?? []).map((x) => x.id),
        diaryStartedAt: diary?.startedAt ?? "",
        diaryFinishedAt: diary?.finishedAt ?? "",
        diarySource: diary?.diarySource ?? "",
        diaryStoragePlace: diary?.diaryStoragePlace ?? "",
      };
    },
  });

  if (isLoading) return <div className="admin-empty">Загрузка записи…</div>;
  if (isError || !data) return <div className="admin-empty">Не удалось загрузить запись.</div>;
  return <AuthorForm key={id} recordId={id} initial={data} onSaved={onSaved} />;
}

function PointEditLoader({ id, onSaved }: { id: number; onSaved: () => void }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["point edit", id],
    queryFn: async (): Promise<PointCreate> => {
      const p = await pointService.getPointById(id);
      const coord = p.pointCoordinates?.[0];
      return {
        rayonId: p.rayonId,
        street: p.street,
        building: p.building,
        latitude: coord?.latitude ?? null,
        longitude: coord?.longitude ?? null,
        pointTypeId: p.pointTypeId,
        pointSubtypeId: p.pointSubtypeId ?? null,
        pointSubsubtypeId: p.pointSubsubtypeId ?? null,
        name: p.name,
        description: p.description ?? null,
      };
    },
  });

  if (isLoading) return <div className="admin-empty">Загрузка записи…</div>;
  if (isError || !data) return <div className="admin-empty">Не удалось загрузить запись.</div>;
  return <PointForm key={id} recordId={id} initial={data} onSaved={onSaved} />;
}

function NoteEditLoader({ id, onSaved }: { id: number; onSaved: () => void }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["note edit", id],
    queryFn: () => noteService.getNoteForEdit(id),
  });

  if (isLoading) return <div className="admin-empty">Загрузка записи…</div>;
  if (isError || !data) return <div className="admin-empty">Не удалось загрузить запись.</div>;
  return <NoteForm key={id} recordId={id} initial={data} onSaved={onSaved} />;
}

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useAtom } from "jotai";
import {
  activeFilterTabAtom,
  archiveObjectFilters,
  archiveArrayFilters,
  archiveScalarFilters,
  type ObjectFiltersType,
  type ArrayFiltersType,
  type ScalarFiltersType,
} from "../../store/archiveAtoms";
import "./ArchiveFilters.css";
import { useNoteFilters } from "../../hooks/notes/useNoteFilters";
import { useAuthorFilters } from "../../hooks/authors/useAuthorFilters";
import { useAuthors } from "../../hooks/authors/useAuthors";
import { usePointTypes } from "../../hooks/points/usePointTypes";
import { usePoints } from "../../hooks/points/usePoints";
import { type FilterItem } from "../../types/common/common.types";
import {
  PLACE_KIND_LABELS,
  typesForKind,
  type PlaceKind,
} from "../../utils/placeKind";

interface ArchiveFiltersProps {
  options: {
    districts: string[];
    pointTypes: string[];
    pointSubtypes: string[];
    streets: string[];
    buildings: string[];
    addresses: string[];
  };
}

function ArchiveFilters({ options }: ArchiveFiltersProps) {
  const [activeTab] = useAtom(activeFilterTabAtom);
  const [objectFilters, setObjectFilters] = useAtom(archiveObjectFilters);
  const [arrayFilters, setArrayFilters] = useAtom(archiveArrayFilters);
  const [scalarFilters, setScalarFilters] = useAtom(archiveScalarFilters);

  const { data: noteFiltersData } = useNoteFilters();
  const { data: authorsData } = useAuthors();
  const { data: authorFiltersData } = useAuthorFilters();
  const { data: pointTypesData } = usePointTypes();

  // Каскад вкладки «Место»: Тип места (Здание/Другое) → Подтип (point_type)
  // → Тип учреждения (point_subtype) → Подтип учреждения (point_subsubtype).
  const placeKind = scalarFilters.placeKind as PlaceKind | "";
  const subtypeOptionList =
    pointTypesData?.find((t) => t.name === scalarFilters.pointType)
      ?.pointSubtypes ?? [];
  const subsubtypeOptionList =
    subtypeOptionList.find((s) => s.name === scalarFilters.pointSubtype)
      ?.pointSubsubtypes ?? [];
  const typeOptionNames = typesForKind(pointTypesData, placeKind).map(
    (t) => t.name,
  );

  // «Дом» доступен только при выбранной улице — список домов этой улицы.
  const { data: pointsData } = usePoints();
  const buildingOptionsForStreet = scalarFilters.street
    ? [
        ...new Set(
          (pointsData ?? [])
            .filter((p) => (p.street ?? "").trim() === scalarFilters.street)
            .map((p) => (p.building ?? "").trim())
            .filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b, "ru"))
    : [];

  // Установить поле «Место» и сбросить зависимые поля ниже по каскаду.
  const setPlaceFields = (updates: Partial<ScalarFiltersType>) =>
    setScalarFilters((prev) => ({ ...prev, ...updates }));

  const onUpdateObjectFilters = (
    update: FilterItem,
    key: keyof ObjectFiltersType,
  ) => {
    setObjectFilters((prev) => {
      const pr = prev[key];

      if (pr.find((item) => item.id === update.id)) {
        return {
          ...prev,
          [key]: pr.filter((item) => item.id !== update.id),
        };
      } else {
        return {
          ...prev,
          [key]: [...pr, update],
        };
      }
    });
  };

  const onUpdateArrayFilters = (
    update: string,
    key: keyof ArrayFiltersType,
  ) => {
    setArrayFilters((prev) => {
      const pr = prev[key];

      if (pr.find((item) => item === update)) {
        return {
          ...prev,
          [key]: pr.filter((item) => item !== update),
        };
      } else {
        return {
          ...prev,
          [key]: [...pr, update],
        };
      }
    });
  };

  const onUpdateScalarFilters = (
    update: number | string | null,
    key: keyof ScalarFiltersType,
  ) => {
    setScalarFilters((prev) => {
      return {
        ...prev,
        [key]: update,
      };
    });
  };

  const isObjectChecked = (item: FilterItem, key: keyof ObjectFiltersType) =>
    objectFilters[key].some((picked) => picked.id === item.id);

  return (
    <section className="archive-panel archive-panel--filters custom-scrollbar">
      <div className="archive-filter-grid">
        {/* --- ВКЛАДКА: ОБЩЕЕ --- */}
        {activeTab === "general" && (
          <>
            <FilterSection title="Временной промежуток">
              <div className="archive-filter-grid__dates">
                <input
                  type="date"
                  value={scalarFilters.startDate}
                  onChange={(e) =>
                    onUpdateScalarFilters(e.target.value, "startDate")
                  }
                />
                <span />
                <input
                  type="date"
                  value={scalarFilters.endDate}
                  onChange={(e) =>
                    onUpdateScalarFilters(e.target.value, "endDate")
                  }
                />
              </div>
            </FilterSection>

            <FilterSection title="Тип свидетельства">
              <div className="archive-checkbox-list">
                {noteFiltersData?.noteTypes.map((type) => (
                  <CheckboxRow
                    key={type.id}
                    checked={isObjectChecked(type, "noteTypes")}
                    label={type.name}
                    onChange={() => onUpdateObjectFilters(type, "noteTypes")}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Ретроспектива">
              <div className="archive-checkbox-list">
                {noteFiltersData?.temporalities.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    checked={isObjectChecked(value, "temporalities")}
                    label={value.name}
                    onChange={() =>
                      onUpdateObjectFilters(value, "temporalities")
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <ChipFilterSection
              title="Тематики"
              placeholder="Введите тематику..."
              items={noteFiltersData?.tags ?? []}
              selected={objectFilters.tags}
              onToggle={(item) => onUpdateObjectFilters(item, "tags")}
            />

            <ChipFilterSection
              title="Упоминание/связанные организации"
              placeholder="Введите организацию..."
              items={noteFiltersData?.organizations ?? []}
              selected={objectFilters.organizations}
              onToggle={(item) => onUpdateObjectFilters(item, "organizations")}
            />

            <ChipFilterSection
              title="Упоминание городских названий"
              placeholder="Введите название..."
              items={noteFiltersData?.cityNames ?? []}
              selected={objectFilters.cityNames}
              onToggle={(item) => onUpdateObjectFilters(item, "cityNames")}
            />

            <ChipFilterSection
              title="Упоминание географических названий"
              placeholder="Введите название..."
              items={noteFiltersData?.geoNames ?? []}
              selected={objectFilters.geoNames}
              onToggle={(item) => onUpdateObjectFilters(item, "geoNames")}
            />
          </>
        )}

        {/* --- ВКЛАДКА: ПЕРСОНАЛИЯ --- */}
        {activeTab === "person" && (
          <>
            <FilterSection title="Автор">
              <FilterSelect
                value={
                  scalarFilters.authorId != null
                    ? String(scalarFilters.authorId)
                    : ""
                }
                placeholder="Все персоналии"
                options={[
                  { value: "", label: "Все персоналии" },
                  ...(authorsData ?? []).map((author) => ({
                    value: String(author.authorId),
                    label: [author.lastName, author.firstName, author.middleName]
                      .filter(Boolean)
                      .join(" "),
                  })),
                ]}
                onChange={(value) =>
                  onUpdateScalarFilters(
                    value === "" ? null : Number(value),
                    "authorId",
                  )
                }
              />
            </FilterSection>

            <FilterSection title="Дата рождения">
              <div className="archive-filter-grid__dates">
                <input
                  type="date"
                  value={scalarFilters.birthdayStart}
                  onChange={(event) =>
                    onUpdateScalarFilters(event.target.value, "birthdayStart")
                  }
                />
                <span />
                <input
                  type="date"
                  value={scalarFilters.birthdayEnd}
                  onChange={(event) =>
                    onUpdateScalarFilters(event.target.value, "birthdayEnd")
                  }
                />
              </div>
            </FilterSection>

            <FilterSection title="Пол">
              <div className="archive-checkbox-list">
                {(["Мужской", "Женский"] as const).map((value) => (
                  <CheckboxRow
                    key={value === "Женский" ? "F" : "M"}
                    checked={arrayFilters.genders.includes(
                      value === "Женский" ? "F" : "M",
                    )}
                    label={value}
                    onChange={() =>
                      onUpdateArrayFilters(
                        value === "Женский" ? "F" : "M",
                        "genders",
                      )
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Наличие детей">
              <SelectField
                value={scalarFilters.hasChildren}
                options={["yes", "no"]}
                displayOptions={["Есть дети", "Нет детей"]}
                onChange={(value) =>
                  onUpdateScalarFilters(value, "hasChildren")
                }
              />
            </FilterSection>

            <FilterSection title="Партийность">
              <div className="archive-checkbox-list">
                {authorFiltersData?.politicalParties.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    checked={isObjectChecked(value, "politicalParties")}
                    label={value.name}
                    onChange={() =>
                      onUpdateObjectFilters(value, "politicalParties")
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Образование">
              <div className="archive-checkbox-list">
                {authorFiltersData?.educations.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    checked={isObjectChecked(value, "educations")}
                    label={value.name}
                    onChange={() => onUpdateObjectFilters(value, "educations")}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Тип деятельности">
              <div className="archive-checkbox-list">
                {authorFiltersData?.occupations.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    checked={isObjectChecked(value, "occupations")}
                    label={value.name}
                    onChange={() => onUpdateObjectFilters(value, "occupations")}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Тип карточки">
              <div className="archive-checkbox-list">
                {authorFiltersData?.cards.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    checked={isObjectChecked(value, "cards")}
                    label={value.name}
                    onChange={() => onUpdateObjectFilters(value, "cards")}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Семейное положение">
              <div className="archive-checkbox-list">
                {authorFiltersData?.familyStatuses.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    checked={isObjectChecked(value, "familyStatuses")}
                    label={value.name}
                    onChange={() =>
                      onUpdateObjectFilters(value, "familyStatuses")
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Национальность">
              <div className="archive-checkbox-list">
                {authorFiltersData?.nationalities.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    checked={isObjectChecked(value, "nationalities")}
                    label={value.name}
                    onChange={() =>
                      onUpdateObjectFilters(value, "nationalities")
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Религиозная идентификация">
              <div className="archive-checkbox-list">
                {authorFiltersData?.religions.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    checked={isObjectChecked(value, "religions")}
                    label={value.name}
                    onChange={() => onUpdateObjectFilters(value, "religions")}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Социальное происхождение">
              <div className="archive-checkbox-list">
                {authorFiltersData?.socialClasses.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    checked={isObjectChecked(value, "socialClasses")}
                    label={value.name}
                    onChange={() =>
                      onUpdateObjectFilters(value, "socialClasses")
                    }
                  />
                ))}
              </div>
            </FilterSection>
          </>
        )}

        {/* --- ВКЛАДКА: МЕСТО --- */}
        {activeTab === "place" && (
          <>
            <FilterSection title="Район">
              <SelectField
                value={scalarFilters.district}
                options={options.districts}
                onChange={(value) => onUpdateScalarFilters(value, "district")}
              />
            </FilterSection>

            <FilterSection title="Место">
              <SelectField
                value={scalarFilters.placeKind}
                options={["building", "other"]}
                displayOptions={[
                  PLACE_KIND_LABELS.building,
                  PLACE_KIND_LABELS.other,
                ]}
                onChange={(value) =>
                  setPlaceFields({
                    placeKind: value,
                    pointType: "",
                    pointSubtype: "",
                    pointSubsubtype: "",
                  })
                }
              />
            </FilterSection>

            <FilterSection title="Тип места">
              <SelectField
                value={scalarFilters.pointType}
                options={typeOptionNames}
                onChange={(value) =>
                  setPlaceFields({
                    pointType: value,
                    pointSubtype: "",
                    pointSubsubtype: "",
                  })
                }
              />
            </FilterSection>

            {subtypeOptionList.length > 0 && (
              <FilterSection title="Тип учреждения/предприятия">
                <SelectField
                  value={scalarFilters.pointSubtype}
                  options={subtypeOptionList.map((s) => s.name)}
                  onChange={(value) =>
                    setPlaceFields({
                      pointSubtype: value,
                      pointSubsubtype: "",
                    })
                  }
                />
              </FilterSection>
            )}

            {subsubtypeOptionList.length > 0 && (
              <FilterSection title="Подтип учреждения/предприятия">
                <SelectField
                  value={scalarFilters.pointSubsubtype}
                  options={subsubtypeOptionList.map((s) => s.name)}
                  onChange={(value) =>
                    setPlaceFields({ pointSubsubtype: value })
                  }
                />
              </FilterSection>
            )}

            <FilterSection title="Улица">
              <SelectField
                value={scalarFilters.street}
                options={options.streets}
                onChange={(value) =>
                  setPlaceFields({ street: value, building: "" })
                }
              />
            </FilterSection>

            {scalarFilters.street && (
              <FilterSection title="Дом">
                <SelectField
                  value={scalarFilters.building}
                  options={buildingOptionsForStreet}
                  onChange={(value) =>
                    onUpdateScalarFilters(value, "building")
                  }
                />
              </FilterSection>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// Случайная выборка n элементов (для дефолтного показа фильтров, чтобы
// прокрутка не была длинной). Перемешивание — копия + Фишер–Йейтс.
function pickRandom<T>(items: T[], n: number): T[] {
  if (items.length <= n) return items;
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

const DEFAULT_CHIP_LIMIT = 15;

// Секция фильтра в виде чипов с поиском (как «Тематики»). По умолчанию (без
// ввода) показывает случайные 15 значений + уже выбранные, чтобы список не
// был длинным. При вводе ищет по всем значениям.
function ChipFilterSection({
  title,
  placeholder,
  items,
  selected,
  onToggle,
}: {
  title: string;
  placeholder: string;
  items: FilterItem[];
  selected: FilterItem[];
  onToggle: (item: FilterItem) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLocaleLowerCase("ru-RU");

  // Случайные 15 — стабильны, пока не изменится сам список значений.
  const sample = useMemo(
    () => pickRandom(items, DEFAULT_CHIP_LIMIT),
    [items],
  );

  const selectedIds = new Set(selected.map((s) => s.id));

  const visible = useMemo(() => {
    if (q) {
      return items.filter((i) => i.name.toLocaleLowerCase("ru-RU").includes(q));
    }
    // Без запроса: выбранные всегда видимы + случайные 15 (без дублей).
    const seen = new Set<number>();
    const result: FilterItem[] = [];
    for (const item of [...selected, ...sample]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        result.push(item);
      }
    }
    return result;
  }, [q, items, selected, sample]);

  return (
    <FilterSection title={title}>
      <input
        type="text"
        className="archive-filter-section__search"
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="archive-chip-grid">
        {visible.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`chip chip--tag${selectedIds.has(item.id) ? " is-active" : ""}`}
            onClick={() => onToggle(item)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </FilterSection>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="archive-filter-section">
      <div className="archive-filter-section__title">
        <span>{title}</span>
      </div>
      {children}
    </section>
  );
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      className={`archive-checkbox-row${checked ? " is-checked" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
    >
      <span className="archive-checkbox-row__control" />
      <span className="archive-checkbox-row__label">{label}</span>
    </label>
  );
}

function SelectField({
  value,
  options,
  displayOptions,
  onChange,
  placeholder = "Все значения",
}: {
  value: string;
  options: string[];
  displayOptions?: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <FilterSelect
      value={value}
      placeholder={placeholder}
      options={[
        { value: "", label: placeholder },
        ...options.map((option, index) => ({
          value: option,
          label: displayOptions ? displayOptions[index] : option,
        })),
      ]}
      onChange={onChange}
    />
  );
}

interface SelectOption {
  value: string;
  label: string;
}

// Кастомный выпадающий список в стиле сайта (вместо нативного <select>):
// стилизуется и закрытое поле, и сама панель опций.
function FilterSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selected = options.find((option) => option.value === value && option.value !== "");

  return (
    <div className={`filter-select${open ? " is-open" : ""}`} ref={ref}>
      <button
        type="button"
        className="filter-select__control"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={`filter-select__value${selected ? "" : " is-placeholder"}`}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={18} className="filter-select__chevron" />
      </button>

      {open && (
        <ul className="filter-select__menu" role="listbox">
          {options.map((option) => (
            <li key={option.value || "__all__"}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={`filter-select__option${option.value === value ? " is-selected" : ""}`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ArchiveFilters;

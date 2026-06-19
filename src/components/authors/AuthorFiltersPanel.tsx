import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { ChevronDown } from "lucide-react";
import type { FilterItem } from "../../types/common/common.types";
import type { AuthorDetailed, AuthorFilters } from "../../types/author/author.type";
import type { AuthorPageFilters } from "../../utils/authorPageFilters";
import "../archive/ArchiveFilters.css";

type ItemArrayKey =
  | "politicalParties"
  | "educations"
  | "occupations"
  | "cards"
  | "familyStatuses"
  | "nationalities"
  | "religions"
  | "socialClasses";

interface Props {
  filters: AuthorPageFilters;
  setFilters: Dispatch<SetStateAction<AuthorPageFilters>>;
  options?: AuthorFilters;
  authors: AuthorDetailed[];
}

/**
 * Фильтры страницы «Авторы дневников» — повторяют вкладку «Автор» на карте.
 * Состояние локальное (передаётся из страницы), визуал — те же классы фильтров.
 */
function AuthorFiltersPanel({ filters, setFilters, options, authors }: Props) {
  const toggleItem = (key: ItemArrayKey, item: FilterItem) =>
    setFilters((prev) => {
      const arr = prev[key];
      const exists = arr.some((x) => x.id === item.id);
      return {
        ...prev,
        [key]: exists ? arr.filter((x) => x.id !== item.id) : [...arr, item],
      };
    });

  const isChecked = (key: ItemArrayKey, item: FilterItem) =>
    filters[key].some((x) => x.id === item.id);

  const toggleGender = (g: "M" | "F") =>
    setFilters((prev) => ({
      ...prev,
      genders: prev.genders.includes(g)
        ? prev.genders.filter((x) => x !== g)
        : [...prev.genders, g],
    }));

  return (
    <section className="archive-panel archive-panel--filters custom-scrollbar">
      <div className="archive-filter-grid">
        <FilterSection title="Автор">
          <FilterSelect
            value={filters.authorId != null ? String(filters.authorId) : ""}
            placeholder="Все персоналии"
            options={[
              { value: "", label: "Все персоналии" },
              ...authors.map((a) => ({
                value: String(a.authorId),
                label: [a.lastName, a.firstName, a.middleName]
                  .filter(Boolean)
                  .join(" "),
              })),
            ]}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                authorId: value === "" ? null : Number(value),
              }))
            }
          />
        </FilterSection>

        <FilterSection title="Дата рождения">
          <div className="archive-filter-grid__dates">
            <input
              type="date"
              value={filters.birthFrom}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, birthFrom: e.target.value }))
              }
            />
            <span />
            <input
              type="date"
              value={filters.birthTo}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, birthTo: e.target.value }))
              }
            />
          </div>
        </FilterSection>

        <FilterSection title="Пол">
          <div className="archive-checkbox-list">
            {(["Мужской", "Женский"] as const).map((label) => {
              const g = label === "Женский" ? "F" : "M";
              return (
                <CheckboxRow
                  key={g}
                  checked={filters.genders.includes(g)}
                  label={label}
                  onChange={() => toggleGender(g)}
                />
              );
            })}
          </div>
        </FilterSection>

        <FilterSection title="Наличие детей">
          <SelectField
            value={filters.hasChildren}
            options={["yes", "no"]}
            displayOptions={["Есть дети", "Нет детей"]}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                hasChildren: value as AuthorPageFilters["hasChildren"],
              }))
            }
          />
        </FilterSection>

        <CheckSection
          title="Партийность"
          items={options?.politicalParties}
          isChecked={(i) => isChecked("politicalParties", i)}
          onToggle={(i) => toggleItem("politicalParties", i)}
        />
        <CheckSection
          title="Образование"
          items={options?.educations}
          isChecked={(i) => isChecked("educations", i)}
          onToggle={(i) => toggleItem("educations", i)}
        />
        <CheckSection
          title="Тип деятельности"
          items={options?.occupations}
          isChecked={(i) => isChecked("occupations", i)}
          onToggle={(i) => toggleItem("occupations", i)}
        />
        <CheckSection
          title="Тип карточки"
          items={options?.cards}
          isChecked={(i) => isChecked("cards", i)}
          onToggle={(i) => toggleItem("cards", i)}
        />
        <CheckSection
          title="Семейное положение"
          items={options?.familyStatuses}
          isChecked={(i) => isChecked("familyStatuses", i)}
          onToggle={(i) => toggleItem("familyStatuses", i)}
        />
        <CheckSection
          title="Национальность"
          items={options?.nationalities}
          isChecked={(i) => isChecked("nationalities", i)}
          onToggle={(i) => toggleItem("nationalities", i)}
        />
        <CheckSection
          title="Религиозная идентификация"
          items={options?.religions}
          isChecked={(i) => isChecked("religions", i)}
          onToggle={(i) => toggleItem("religions", i)}
        />
        <CheckSection
          title="Социальное происхождение"
          items={options?.socialClasses}
          isChecked={(i) => isChecked("socialClasses", i)}
          onToggle={(i) => toggleItem("socialClasses", i)}
        />
      </div>
    </section>
  );
}

function CheckSection({
  title,
  items,
  isChecked,
  onToggle,
}: {
  title: string;
  items?: FilterItem[];
  isChecked: (item: FilterItem) => boolean;
  onToggle: (item: FilterItem) => void;
}) {
  if (!items || items.length === 0) return null;
  return (
    <FilterSection title={title}>
      <div className="archive-checkbox-list">
        {items.map((item) => (
          <CheckboxRow
            key={item.id}
            checked={isChecked(item)}
            label={item.name}
            onChange={() => onToggle(item)}
          />
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

  const selected = options.find(
    (option) => option.value === value && option.value !== "",
  );

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

export default AuthorFiltersPanel;

import type { ReactNode } from "react";
import { useAtom } from "jotai";
import {
  BookOpenText,
  Building2,
  CalendarDays,
  Clock3,
  Flag,
  Landmark,
  MapPinned,
  NotebookPen,
  Tag,
  UserRound,
  UsersRound,
} from "lucide-react";
import { validateDateRange } from "../../utils/dateValidation";
import { activeFilterTabAtom, archiveFiltersAtom } from "../../store/archiveAtoms";
import type {
  PartyStatus,
  WitnessKind,
} from "../../types/archive";

interface ArchiveFiltersProps {
  options: {
    witnessKinds: WitnessKind[];
    retrospectiveKinds: string[];
    significances: string[];
    tags: string[];
    authors: { id: string; fullName: string }[];
    districts: string[];
    spaces: string[];
    streets: string[];
    buildings: string[];
    addresses: string[];
  };
}

function toggleArrayValue<T extends string>(list: T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function ArchiveFilters({ options }: ArchiveFiltersProps) {
  const [activeTab, setActiveTab] = useAtom(activeFilterTabAtom);
  const [filters, setFilters] = useAtom(archiveFiltersAtom);

  // Общий метод обновления
  const onChange = (update: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...update }));
  };

  // Исправленная логика дат: прогоняем через утилиту validateDateRange
  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    const nextStart = field === "startDate" ? value : filters.startDate;
    const nextEnd = field === "endDate" ? value : filters.endDate;
    
    const validated = validateDateRange(nextStart, nextEnd);
    
    setFilters((prev) => ({
      ...prev,
      startDate: validated.startDate,
      endDate: validated.endDate,
    }));
  };

  return (
    <section className="archive-panel archive-panel--filters">
      <div className="archive-filter-tabs">
        <button
          type="button"
          className={`archive-filter-tabs__item${activeTab === "general" ? " is-active is-blue" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          общее
        </button>
        <button
          type="button"
          className={`archive-filter-tabs__item${activeTab === "person" ? " is-active is-green" : ""}`}
          onClick={() => setActiveTab("person")}
        >
          персоналия
        </button>
        <button
          type="button"
          className={`archive-filter-tabs__item${activeTab === "place" ? " is-active is-amber" : ""}`}
          onClick={() => setActiveTab("place")}
        >
          место
        </button>
      </div>

      <div className="archive-filter-grid">
        {activeTab === "general" && (
          <>
            <FilterSection icon={Clock3} title="временной промежуток">
              <div className="archive-filter-grid__dates">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleDateChange("startDate", e.target.value)}
                />
                <span />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleDateChange("endDate", e.target.value)}
                />
              </div>
            </FilterSection>

            <FilterSection icon={NotebookPen} title="тип свидетельства">
              <div className="archive-checkbox-list">
                {options.witnessKinds.map((value) => (
                  <CheckboxRow
                    key={value}
                    checked={filters.witnessKinds.includes(value)}
                    label={value}
                    onChange={() =>
                      onChange({
                        witnessKinds: toggleArrayValue(filters.witnessKinds, value),
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection icon={Flag} title="значимость">
              <div className="archive-checkbox-list">
                {options.significances.map((value) => (
                  <CheckboxRow
                    key={value}
                    checked={filters.significances.includes(value as any)}
                    label={value}
                    onChange={() =>
                      onChange({
                        significances: toggleArrayValue(filters.significances as any, value) as any,
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection icon={Tag} title="тематики">
              <div className="archive-chip-grid">
                {options.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`chip chip--tag${filters.tags.includes(tag) ? " is-active" : ""}`}
                    onClick={() => onChange({ tags: toggleArrayValue(filters.tags, tag) })}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </FilterSection>
          </>
        )}

        {activeTab === "person" && (
          <>
            <FilterSection icon={UsersRound} title="персоналии">
              <SelectField
                value={filters.authorId}
                options={options.authors.map(a => a.id)} 
                displayOptions={options.authors.map(a => a.fullName)}
                onChange={(val) => onChange({ authorId: val })}
              />
            </FilterSection>

            <FilterSection icon={UserRound} title="пол">
              <div className="archive-checkbox-list">
                {["Мужской", "Женский"].map((value) => (
                  <CheckboxRow
                    key={value}
                    checked={filters.genders.includes(value as any)}
                    label={value}
                    onChange={() =>
                      onChange({
                        genders: toggleArrayValue(filters.genders as any, value) as any,
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>
          </>
        )}

        {activeTab === "place" && (
          <>
            <FilterSection icon={MapPinned} title="район">
              <SelectField
                value={filters.district}
                options={options.districts}
                onChange={(value) => onChange({ district: value })}
              />
            </FilterSection>

            <FilterSection icon={MapPinned} title="улица">
              <SelectField
                value={filters.street}
                options={options.streets}
                onChange={(value) => onChange({ street: value })}
              />
            </FilterSection>
          </>
        )}
      </div>
    </section>
  );
}

function FilterSection({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="archive-filter-section">
      <div className="archive-filter-section__title">
        <Icon size={16} strokeWidth={1.9} />
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
    <label className={`archive-checkbox-row${checked ? " is-checked" : ""}`} onClick={(e) => { e.preventDefault(); onChange(); }}>
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
}: {
  value: string;
  options: string[];
  displayOptions?: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Все значения</option>
      {options.map((option, index) => (
        <option key={option} value={option}>
          {displayOptions ? displayOptions[index] : option}
        </option>
      ))}
    </select>
  );
}

export default ArchiveFilters;
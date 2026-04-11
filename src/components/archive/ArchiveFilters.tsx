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
import { activeFilterTabAtom, archiveFiltersAtom } from "../../store/archiveAtoms";
import type {
  PartyStatus,
  RetrospectiveKind,
  SignificanceKind,
  WitnessKind,
} from "../../types/archive";

interface ArchiveFiltersProps {
  options: {
    witnessKinds: WitnessKind[];
    retrospectiveKinds: RetrospectiveKind[];
    significances: SignificanceKind[];
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

  const onChange = (update: any) => {
    setFilters((prev) => ({ ...prev, ...update }));
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

      {activeTab === "general" ? (
        <div className="archive-filter-grid">
          <FilterSection icon={Clock3} title="временной промежуток">
            <div className="archive-filter-grid__dates">
              <input
                type="date"
                value={filters.startDate}
                onChange={(event) => onChange({ startDate: event.target.value })}
              />
              <span />
              <input
                type="date"
                value={filters.endDate}
                onChange={(event) => onChange({ endDate: event.target.value })}
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

          <FilterSection icon={BookOpenText} title="ретроспектива">
            <div className="archive-checkbox-list">
              {options.retrospectiveKinds.map((value) => (
                <CheckboxRow
                  key={value}
                  checked={filters.retrospectiveKinds.includes(value)}
                  label={value}
                  onChange={() =>
                    onChange({
                      retrospectiveKinds: toggleArrayValue(filters.retrospectiveKinds, value),
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
                  checked={filters.significances.includes(value)}
                  label={value}
                  onChange={() =>
                    onChange({
                      significances: toggleArrayValue(filters.significances, value),
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
                  onClick={() =>
                    onChange({ tags: toggleArrayValue(filters.tags, tag) })
                  }
                >
                  {tag}
                </button>
              ))}
            </div>
          </FilterSection>
        </div>
      ) : null}

      {activeTab === "person" ? (
        <div className="archive-filter-grid">
          <FilterSection icon={UsersRound} title="персоналии">
            <select
              value={filters.authorId}
              onChange={(event) => onChange({ authorId: event.target.value })}
            >
              <option value="">Все персоналии</option>
              {options.authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.fullName}
                </option>
              ))}
            </select>
          </FilterSection>

          <FilterSection icon={CalendarDays} title="дата рождения">
            <div className="archive-filter-grid__dates">
              <input
                type="date"
                value={filters.birthDateStart}
                onChange={(event) =>
                  onChange({ birthDateStart: event.target.value })
                }
              />
              <span />
              <input
                type="date"
                value={filters.birthDateEnd}
                onChange={(event) =>
                  onChange({ birthDateEnd: event.target.value })
                }
              />
            </div>
          </FilterSection>

          <FilterSection icon={UserRound} title="пол">
            <div className="archive-checkbox-list">
              {(["Мужской", "Женский"] as const).map((value) => (
                <CheckboxRow
                  key={value}
                  checked={filters.genders.includes(value)}
                  label={value}
                  onChange={() =>
                    onChange({
                      genders: toggleArrayValue(filters.genders, value),
                    })
                  }
                />
              ))}
            </div>
          </FilterSection>

          <FilterSection icon={Flag} title="партийность">
            <div className="archive-checkbox-list">
              {(["Партийный", "Беспартийный"] as PartyStatus[]).map((value) => (
                <CheckboxRow
                  key={value}
                  checked={filters.partyStatuses.includes(value)}
                  label={value}
                  onChange={() =>
                    onChange({
                      partyStatuses: toggleArrayValue(filters.partyStatuses, value),
                    })
                  }
                />
              ))}
            </div>
          </FilterSection>
        </div>
      ) : null}

      {activeTab === "place" ? (
        <div className="archive-filter-grid">
          <FilterSection icon={MapPinned} title="район">
            <SelectField
              value={filters.district}
              options={options.districts}
              onChange={(value) => onChange({ district: value })}
            />
          </FilterSection>

          <FilterSection icon={Landmark} title="пространство">
            <SelectField
              value={filters.space}
              options={options.spaces}
              onChange={(value) => onChange({ space: value })}
            />
          </FilterSection>

          <FilterSection icon={MapPinned} title="улица">
            <SelectField
              value={filters.street}
              options={options.streets}
              onChange={(value) => onChange({ street: value })}
            />
          </FilterSection>

          <FilterSection icon={Building2} title="здание">
            <SelectField
              value={filters.building}
              options={options.buildings}
              onChange={(value) => onChange({ building: value })}
            />
          </FilterSection>

          <FilterSection icon={MapPinned} title="адрес">
            <SelectField
              value={filters.address}
              options={options.addresses}
              onChange={(value) => onChange({ address: value })}
            />
          </FilterSection>
        </div>
      ) : null}
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
    <label className={`archive-checkbox-row${checked ? " is-checked" : ""}`}>
      <input className="archive-checkbox-row__input" type="checkbox" checked={checked} onChange={onChange} />
      <span className="archive-checkbox-row__control" aria-hidden="true" />
      <span className="archive-checkbox-row__label">{label}</span>
    </label>
  );
}

function SelectField({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Все значения</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default ArchiveFilters;

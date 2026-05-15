/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import { useAtom } from "jotai";
import {
  Clock3,
  Flag,
  NotebookPen,
  Tag,
  UsersRound,
  UserRound,
  CalendarDays,
  MapPinned,
  Building2,
  Navigation,
} from "lucide-react";
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
import { type FilterItem } from "../../types/common/common.types";

interface ArchiveFiltersProps {
  options: {
    districts: string[];
    spaces: string[];
    streets: string[];
    buildings: string[];
    addresses: string[];
  };
}

function ArchiveFilters({ options }: ArchiveFiltersProps) {
  const [activeTab,] = useAtom(activeFilterTabAtom);
  const [objectFilters, setObjectFilters] = useAtom(archiveObjectFilters);
  const [arrayFilters, setArrayFilters] = useAtom(archiveArrayFilters);
  const [scalarFilters, setScalarFilters] = useAtom(archiveScalarFilters);

  const { data: noteFiltersData } = useNoteFilters();
  const { data: authorsData } = useAuthors();
  const { data: authorFiltersData } = useAuthorFilters();

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
    update: number | string,
    key: keyof ScalarFiltersType,
  ) => {
    setScalarFilters((prev) => {
      return {
        ...prev,
        [key]: update,
      };
    });
  };

  return (
    <section className="archive-panel archive-panel--filters custom-scrollbar">
      <div className="archive-filter-grid">
        {/* --- ВКЛАДКА: ОБЩЕЕ --- */}
        {activeTab === "general" && (
          <>
            <FilterSection icon={Clock3} title="временной промежуток">
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

            <FilterSection icon={NotebookPen} title="тип свидетельства">
              <div className="archive-checkbox-list">
                {noteFiltersData?.noteTypes.map((type) => (
                  <CheckboxRow
                    key={type.id}
                    checked={objectFilters.noteTypes.includes(type)}
                    label={type.name}
                    onChange={() => onUpdateObjectFilters(type, "noteTypes")}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection icon={Flag} title="значимость">
              <div className="archive-checkbox-list">
                {/* {options.significances.map((value) => (
                  <CheckboxRow
                    key={value}
                    checked={filters.significances.includes(value as any)}
                    label={value}
                    onChange={() =>
                      onChange({
                        significances: toggleArrayValue(
                          filters.significances as any,
                          value,
                        ) as any,
                      })
                    }
                  />
                ))} */}
              </div>
            </FilterSection>

            <FilterSection icon={Tag} title="тематики">
              <div className="archive-chip-grid">
                {noteFiltersData?.tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`chip chip--tag${objectFilters.tags.includes(tag) ? " is-active" : ""}`}
                    onClick={() => onUpdateObjectFilters(tag, "tags")}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </FilterSection>
          </>
        )}

        {/* --- ВКЛАДКА: ПЕРСОНАЛИЯ --- */}
        {activeTab === "person" && (
          <>
            <FilterSection icon={UsersRound} title="персоналии">
              <select
                value={scalarFilters.authorId ?? ""}
                onChange={(event) =>
                  onUpdateScalarFilters(Number(event.target.value), "authorId")
                }
              >
                <option value="">Все персоналии</option>
                {authorsData?.map((author) => (
                  <option key={author.authorId} value={author.authorId}>
                    {`${author.middleName} ${author.firstName} ${author.lastName}`}
                  </option>
                ))}
              </select>
            </FilterSection>

            <FilterSection icon={CalendarDays} title="дата рождения">
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

            <FilterSection icon={UserRound} title="пол">
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

            <FilterSection icon={Flag} title="партийность">
              <div className="archive-checkbox-list">
                {authorFiltersData?.politicalParties.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    checked={objectFilters.politicalParties.includes(value)}
                    label={value.name}
                    onChange={() => {
                      onUpdateObjectFilters(value, "politicalParties");
                    }}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection icon={UserRound} title="Образование">
              <div className="archive-checkbox-list">
                {authorFiltersData?.educations.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    label={value.name}
                    checked={objectFilters.educations.includes(value)}
                    onChange={() => {
                      onUpdateObjectFilters(value, "educations");
                    }}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection icon={UserRound} title="Карточки">
              <div className="archive-checkbox-list">
                {authorFiltersData?.cards.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    label={value.name}
                    checked={objectFilters.educations.includes(value)}
                    onChange={() => {
                      onUpdateObjectFilters(value, "cards");
                    }}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection icon={UserRound} title="Семейное положение">
              <div className="archive-checkbox-list">
                {authorFiltersData?.familyStatuses.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    label={value.name}
                    checked={objectFilters.educations.includes(value)}
                    onChange={() => {
                      onUpdateObjectFilters(value, "familyStatuses");
                    }}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection icon={UserRound} title="Национальности">
              <div className="archive-checkbox-list">
                {authorFiltersData?.nationalities.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    label={value.name}
                    checked={objectFilters.educations.includes(value)}
                    onChange={() => {
                      onUpdateObjectFilters(value, "nationalities");
                    }}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection icon={UserRound} title="Религии">
              <div className="archive-checkbox-list">
                {authorFiltersData?.religions.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    label={value.name}
                    checked={objectFilters.educations.includes(value)}
                    onChange={() => {
                      onUpdateObjectFilters(value, "religions");
                    }}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection icon={UserRound} title="Социальный статус">
              <div className="archive-checkbox-list">
                {authorFiltersData?.socialClasses.map((value) => (
                  <CheckboxRow
                    key={value.id}
                    label={value.name}
                    checked={objectFilters.educations.includes(value)}
                    onChange={() => {
                      onUpdateObjectFilters(value, "socialClasses");
                    }}
                  />
                ))}
              </div>
            </FilterSection>
          </>
        )}

        {/* --- ВКЛАДКА: МЕСТО --- */}
        {activeTab === "place" && (
          <>
            <FilterSection icon={MapPinned} title="район">
              <SelectField
                value={scalarFilters.district}
                options={options.districts}
                onChange={(value) => onUpdateScalarFilters(value, "district")}
              />
            </FilterSection>

            <FilterSection icon={Navigation} title="пространство">
              <SelectField
                value={scalarFilters.space}
                options={options.spaces}
                onChange={(value) => onUpdateScalarFilters(value, "space")}
              />
            </FilterSection>

            <FilterSection icon={MapPinned} title="улица">
              <SelectField
                value={scalarFilters.street}
                options={options.streets}
                onChange={(value) => onUpdateScalarFilters(value, "street")}
              />
            </FilterSection>

            <FilterSection icon={Building2} title="здание">
              <SelectField
                value={scalarFilters.building}
                options={options.buildings}
                onChange={(value) => onUpdateScalarFilters(value, "building")}
              />
            </FilterSection>

            <FilterSection icon={MapPinned} title="адрес">
              <SelectField
                value={scalarFilters.address}
                options={options.addresses}
                onChange={(value) => onUpdateScalarFilters(value, "address")}
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
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={option} value={option}>
          {displayOptions ? displayOptions[index] : option}
        </option>
      ))}
    </select>
  );
}

export default ArchiveFilters;

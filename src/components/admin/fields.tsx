import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { AxiosError } from "axios";
import type { FilterItem } from "../../types/common/common.types";

/** Достаёт человекочитаемое сообщение из ошибки API (detail может быть
 *  строкой или объектом {error}); иначе возвращает fallback. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (detail && typeof detail === "object" && typeof detail.error === "string") {
      return detail.error;
    }
  }
  return fallback;
}

type FieldProps = {
  label: string;
  required?: boolean;
  full?: boolean;
  children: ReactNode;
};

export function Field({ label, required, full, children }: FieldProps) {
  return (
    <label className={`admin-field${full ? " admin-field--full" : ""}`}>
      <span>
        {label}
        {required && <span className="admin-field__req"> *</span>}
      </span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="admin-input" {...props} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="admin-textarea" {...props} />;
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: FilterItem[];
  placeholder?: string;
};

export function Select({ options, placeholder = "— выберите —", ...props }: SelectProps) {
  return (
    <select className="admin-select" {...props}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}

type MultiSelectProps = {
  options: FilterItem[];
  value: number[];
  onChange: (next: number[]) => void;
  emptyText?: string;
};

export function MultiSelect({ options, value, onChange, emptyText = "Справочник пуст" }: MultiSelectProps) {
  if (!options.length) {
    return <div className="admin-multiselect admin-multiselect--empty">{emptyText}</div>;
  }

  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div className="admin-multiselect">
      {options.map((o) => (
        <button
          type="button"
          key={o.id}
          className={`admin-chip${value.includes(o.id) ? " admin-chip--on" : ""}`}
          onClick={() => toggle(o.id)}
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}

type StatusProps = { kind: "ok" | "err"; children: ReactNode };

export function Status({ kind, children }: StatusProps) {
  return <div className={`admin-status admin-status--${kind}`}>{children}</div>;
}

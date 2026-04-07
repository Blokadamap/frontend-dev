import React from "react";

interface RadioProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export const Radio = ({ label, checked, onChange }: RadioProps) => {
  return (
    <label className="ui-radio" onClick={onChange}>
      <div className={`ui-radio__circle ${checked ? 'is-checked' : ''}`}>
        {checked && <div className="ui-radio__dot" />}
      </div>
      <span className="ui-radio__label">{label}</span>
    </label>
  );
};
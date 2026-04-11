import type { ReactNode, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}
export const Input = ({ icon, ...props }: InputProps) => {
  return (
    <div className="ui-input-wrapper">
      {icon && <span>{icon}</span>}
      <input className="ui-input-field" {...props} />
    </div>
  );
};
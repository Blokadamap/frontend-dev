import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'icon';
}

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  const baseClass = "ui-button";
  const variantClass = `ui-button--${variant}`;
  
  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
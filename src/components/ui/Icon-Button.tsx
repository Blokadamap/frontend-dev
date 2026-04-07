import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const IconButton = ({ icon, variant = 'primary', className = '', ...props }: IconButtonProps) => {
  return (
    <button className={`ui-icon-button ui-icon-button--${variant} ${className}`} {...props}>
      {icon}
    </button>
  );
};
import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export const Badge = ({ children, active, onClick }: BadgeProps) => {
  return (
    <div 
      className={`ui-badge ${active ? 'is-active' : ''} ${onClick ? 'is-clickable' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAtomValue } from "jotai";

import { tokenAtom, userAtom } from "../../store/authAtom";
import type { UserRole } from "../../types/auth/auth.types";

type RequireAuthProps = {
  children: ReactNode;
  /** Если задано — пускаем только пользователей с этой ролью. */
  role?: UserRole;
};

export function RequireAuth({ children, role }: RequireAuthProps) {
  const location = useLocation();
  const token = useAtomValue(tokenAtom);
  const user = useAtomValue(userAtom);

  // Валидным считаем только непустой строковый токен (защита от «битых»
  // значений из localStorage от старого флоу авторизации).
  if (typeof token !== "string" || token.length === 0) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user?.role !== role) {
    // Прав не хватает — возвращаем на карту.
    return <Navigate to="/map" replace />;
  }

  return children;
}

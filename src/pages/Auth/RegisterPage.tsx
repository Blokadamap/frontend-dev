import { Navigate } from "react-router-dom";

/**
 * Публичная регистрация отключена: новых редакторов создаёт главный
 * администратор внутри админ-панели (/admin → «Редакторы»).
 * Компонент оставлен как редирект для совместимости со старыми ссылками.
 */
export function RegisterPage() {
  return <Navigate to="/login" replace />;
}

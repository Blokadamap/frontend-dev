import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";

import "./AdminPage.css";
import { tokenAtom, userAtom } from "../../store/authAtom";
import { NoteForm } from "../../components/admin/NoteForm";
import { AuthorForm } from "../../components/admin/AuthorForm";
import { PointForm } from "../../components/admin/PointForm";
import { EditorsPanel } from "../../components/admin/EditorsPanel";
import { AccountForm } from "../../components/admin/AccountForm";
import { RecordsPanel } from "../../components/admin/RecordsPanel";

type TabId = "note" | "author" | "point" | "records" | "editors" | "account";

const TABS: { id: TabId; label: string; title: string; hint: string; superOnly?: boolean }[] = [
  {
    id: "note",
    label: "Свидетельство",
    title: "Новое свидетельство",
    hint: "Цитата из источника, её автор, тип, датировка и привязка к местам на карте.",
  },
  {
    id: "author",
    label: "Автор",
    title: "Новый автор",
    hint: "Биографические данные диариста и сведения о его дневнике.",
  },
  {
    id: "point",
    label: "Место",
    title: "Новое место",
    hint: "Точка на карте: адрес, координаты и тип объекта.",
  },
  {
    id: "records",
    label: "Записи",
    title: "Редактирование записей",
    hint: "Поиск и правка существующих свидетельств, авторов и мест.",
    superOnly: true,
  },
  {
    id: "editors",
    label: "Редакторы",
    title: "Пользователи и доступ",
    hint: "Создание редакторов (только добавление записей) и администраторов.",
    superOnly: true,
  },
  {
    id: "account",
    label: "Аккаунт",
    title: "Смена пароля",
    hint: "Смена пароля вашей учётной записи.",
  },
];

export function AdminPage() {
  const navigate = useNavigate();
  const [user, setUser] = useAtom(userAtom);
  const [, setToken] = useAtom(tokenAtom);
  const [tab, setTab] = useState<TabId>("note");

  const isSuper = user?.role === "superadmin";
  const visibleTabs = TABS.filter((t) => !t.superOnly || isSuper);
  const active = visibleTabs.find((t) => t.id === tab) ?? visibleTabs[0];

  function logout() {
    setToken(null);
    setUser(null);
    navigate("/login");
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <h1 className="admin-header__title">Блокадная карта — админ-панель</h1>
            <p className="admin-header__sub">Пополнение базы свидетельств, авторов и мест</p>
          </div>
          <div className="admin-header__right">
            <div className="admin-user">
              <div>
                <b>{user?.username ?? "—"}</b>
              </div>
              <span className={`admin-badge ${isSuper ? "admin-badge--super" : "admin-badge--editor"}`}>
                {isSuper ? "Главный администратор" : "Редактор"}
              </span>
            </div>
            <button className="admin-btn admin-btn--ghost admin-btn--sm" type="button" onClick={() => navigate("/map")}>
              К карте
            </button>
            <button className="admin-btn admin-btn--ghost admin-btn--sm" type="button" onClick={logout}>
              Выйти
            </button>
          </div>
        </header>

        <div className="admin-body">
          <nav className="admin-nav">
            {visibleTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`admin-nav__item${active.id === t.id ? " admin-nav__item--active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                <span className="admin-nav__dot" />
                {t.label}
              </button>
            ))}
          </nav>

          <section className="admin-content">
            <div className="admin-content__head">
              <h2 className="admin-content__title">{active.title}</h2>
              <p className="admin-content__hint">{active.hint}</p>
            </div>

            {active.id === "note" && <NoteForm />}
            {active.id === "author" && <AuthorForm />}
            {active.id === "point" && <PointForm />}
            {active.id === "records" && isSuper && <RecordsPanel />}
            {active.id === "editors" && isSuper && <EditorsPanel />}
            {active.id === "account" && <AccountForm />}
          </section>
        </div>
      </div>
    </main>
  );
}

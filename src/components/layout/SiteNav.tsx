import { NavLink } from "react-router-dom";
import "./SiteNav.css";

/**
 * Навигация сайта (пилюли из макета front-page).
 * - Текущая страница — обведённая «призрачная» пилюля (золотая рамка, золотой текст).
 * - Остальные доступные ссылки — залитые золотом, белый текст.
 * - Пункты `soon: true` — неактивные «скоро» (страницы ещё не готовы).
 */
type NavItem = {
  label: string;
  to?: string;
  /** Раздел в разработке: показываем, но не кликается. */
  soon?: boolean;
  /** Точное совпадение пути (для «О проекте» = "/"). */
  end?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "О проекте", to: "/", end: true },
  { label: "Карта", to: "/map" },
  { label: "Свидетельства", to: "/evidence" },
  { label: "Авторы дневников", to: "/authors" },
];

function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Основная навигация">
      {NAV_ITEMS.map((item) =>
        item.soon || !item.to ? (
          <span
            key={item.label}
            className="site-nav__item site-nav__item--soon"
            aria-disabled="true"
            title="Скоро"
          >
            {item.label}
          </span>
        ) : (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `site-nav__item ${isActive ? "is-active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ),
      )}
    </nav>
  );
}

export default SiteNav;

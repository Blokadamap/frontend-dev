import SiteNav from "./SiteNav";
import "./Header.css";

/** Статичный хедер для всех страниц, кроме карты. */
function Header() {
  return (
    <header className="site-header">
      <SiteNav />
    </header>
  );
}

export default Header;

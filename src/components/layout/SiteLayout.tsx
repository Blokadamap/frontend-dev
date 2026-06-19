import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./SiteLayout.css";

/** Каркас обычной страницы: статичный хедер сверху, контент, футер снизу. */
function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-layout">
      <Header />
      <main className="site-layout__main">{children}</main>
      <Footer />
    </div>
  );
}

export default SiteLayout;

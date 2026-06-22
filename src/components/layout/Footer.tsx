import { Link } from "react-router-dom";
import "./Footer.css";

const CONTACT_EMAIL = "ndprigodich@itmo.ru";

/** Футер сайта (по макету front-page). */
function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__left">
          <a
            className="site-footer__logo"
            href="https://hs.itmo.ru"
            target="_blank"
            rel="noreferrer"
            aria-label="Центр социальных и гуманитарных наук ИТМО"
          >
            <img src="/itmo-logo.svg" alt="ИТМО — Центр социальных и гуманитарных наук" />
          </a>

          <div className="site-footer__credit">
            <span className="site-footer__divider" aria-hidden="true" />
            <p>
              Создано
              <br />
              при поддержке
            </p>
            <a
              className="site-footer__prozhito"
              href="https://prozhito.org/"
              target="_blank"
              rel="noreferrer"
              aria-label="Центр изучения эго-документов «Прожито»"
            >
              <img src="/prozhito-logo.svg" alt="Центр «Прожито»" />
            </a>
          </div>
        </div>

        <div className="site-footer__contacts">
          <h2>Контакты</h2>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <Link className="site-footer__privacy" to="/privacy">
            Политика обработки персональных данных
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

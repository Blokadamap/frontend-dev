import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./CookieBanner.css";

const STORAGE_KEY = "cookie-consent";

/**
 * Ненавязчивый баннер-уведомление об использовании cookie и Яндекс.Метрики
 * (152-ФЗ: информирование + согласие). Не блокирует сайт. Выбор пользователя
 * запоминается в localStorage — повторно баннер не показывается.
 */
function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "accepted") {
        setVisible(true);
      }
    } catch {
      // localStorage недоступен — показываем баннер по умолчанию
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // игнорируем — баннер просто скроется на эту сессию
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Уведомление об использовании cookie">
      <div className="cookie-banner__inner">
        <p className="cookie-banner__text">
          Мы используем файлы cookie и сервис «Яндекс.Метрика» для сбора
          обезличенной статистики посещений и улучшения сайта. Продолжая
          пользоваться сайтом, вы соглашаетесь с этим. Подробнее — в{" "}
          <Link
            className="cookie-banner__link"
            to="/privacy"
            onClick={() => window.scrollTo({ top: 0, left: 0 })}
          >
            Политике обработки персональных данных
          </Link>
          .
        </p>
        <button
          type="button"
          className="cookie-banner__button"
          onClick={accept}
        >
          Понятно
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// Номер счётчика Яндекс.Метрики. Должен совпадать с номером в index.html.
const COUNTER_ID = 110083093;

declare global {
  interface Window {
    ym?: (id: number, action: string, url?: string) => void;
  }
}

/**
 * Отправляет hit в Яндекс.Метрику при переходах по роутеру (SPA).
 * Первый заход (страница входа) уже учтён автоматическим хитом из сниппета
 * в index.html, поэтому начальное монтирование пропускаем — иначе landing
 * считался бы дважды. Хиты шлём только при последующей смене URL.
 */
export function useYandexMetrika() {
  const location = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    window.ym?.(COUNTER_ID, "hit", window.location.href);
  }, [location]);
}

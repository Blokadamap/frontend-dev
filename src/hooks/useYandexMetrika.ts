import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Номер счётчика Яндекс.Метрики. Должен совпадать с номером в index.html.
const COUNTER_ID = 110083093;

declare global {
  interface Window {
    ym?: (id: number, action: string, url?: string) => void;
  }
}

/**
 * Отправляет hit в Яндекс.Метрику при каждом переходе по роутеру.
 * Нужно, потому что сайт — SPA: смена страницы не перезагружает документ,
 * и счётчик с defer:true сам по себе видит только первый заход.
 */
export function useYandexMetrika() {
  const location = useLocation();

  useEffect(() => {
    window.ym?.(COUNTER_ID, "hit", window.location.href);
  }, [location]);
}

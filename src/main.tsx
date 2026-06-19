import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider as JotaiProvider, getDefaultStore } from "jotai";
import { QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App";
import { queryClient } from "./lib/queryClient";

// Используем единый (default) стор, чтобы код вне React (axios-перехватчики,
// страница входа через getDefaultStore) и компоненты читали один и тот же стор.
const store = getDefaultStore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={store}>
        <App />
      </JotaiProvider>
    </QueryClientProvider>
  </StrictMode>,
)

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import "./AuthPage.css";
import { AuthForm } from "../../components/auth/auth_form/AuthForm";
import { authService } from "../../services/authService";
import { getDefaultStore } from "jotai";
import { tokenAtom, userAtom } from "../../store/authAtom";

export function LoginPage() {
  const navigate = useNavigate();
  const storage = getDefaultStore();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ token, user }) => {
      storage.set(tokenAtom, token);
      storage.set(userAtom, user);
      navigate("/admin");
    },
  });

  return (
    <main className="auth-page">
      <section className="auth-card">
        <AuthForm
          title="Вход в админ-панель"
          submitText="Войти"
          loadingText="Входим..."
          loading={loginMutation.isPending}
          error={loginMutation.isError ? "Неверный логин или пароль" : ""}
          footer={<>Доступ выдаёт главный администратор проекта</>}
          onSubmit={({ username, password }) => {
            loginMutation.mutate({ username, password });
          }}
        />
      </section>
    </main>
  );
}

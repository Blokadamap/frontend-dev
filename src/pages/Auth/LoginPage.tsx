import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import "./AuthPage.css";
import { AuthForm } from "../../components/auth/auth_form/AuthForm";
import { authService } from "../../services/authService";
import { getDefaultStore } from "jotai";
import { tokenAtom } from "../../store/authAtom";

export function LoginPage() {
  const navigate = useNavigate();
  const storage = getDefaultStore();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (token) => {
      storage.set(tokenAtom, token)
      navigate("/map");
    },
  });

  return (
    <main className="auth-page">
      <section className="auth-card">
        <AuthForm
          title="Авторизация"
          submitText="Войти"
          loadingText="Входим..."
          loading={loginMutation.isPending}
          error={loginMutation.isError ? "Неверный логин или пароль" : ""}
          footer={
            <>
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </>
          }
          onSubmit={({ username, password }) => {
            loginMutation.mutate({ username, password });
          }}
        />
      </section>
    </main>
  );
}
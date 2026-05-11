import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import "./AuthPage.css";
import { AuthForm } from "../../components/auth/auth_form/AuthForm";
import { authService } from "../../services/authService";

export function RegisterPage() {
  const navigate = useNavigate();
  const [localError, setLocalError] = useState("");

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      navigate("/login");
    },
  });

  return (
    <main className="auth-page">
      <section className="auth-card">

        <AuthForm
          title="Создать аккаунт"
          submitText="Зарегистрироваться"
          loadingText="Создаем..."
          withRepeatPassword
          loading={registerMutation.isPending}
          error={
            localError ||
            (registerMutation.isError ? "Не удалось зарегистрироваться" : "")
          }
          footer={
            <>
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </>
          }
          onSubmit={({ username, password, repeatPassword }) => {
            setLocalError("");

            if (password !== repeatPassword) {
              setLocalError("Пароли не совпадают");
              return;
            }

            registerMutation.mutate({ username, password });
          }}
        />
      </section>
    </main>
  );
}
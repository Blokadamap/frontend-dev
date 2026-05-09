import { useState, type ReactNode } from "react";

import type { FormEvent } from "react";

import "./AuthForm.css";

type AuthFormProps = {
  title: string;
  submitText: string;
  loadingText: string;
  error?: string;
  loading?: boolean;
  footer: ReactNode;
  withRepeatPassword?: boolean;
  onSubmit: (data: {
    username: string;
    password: string;
    repeatPassword?: string;
  }) => void;
};

export function AuthForm({
  title,
  submitText,
  loadingText,
  error,
  loading = false,
  footer,
  withRepeatPassword = false,
  onSubmit,
}: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    onSubmit({
      username,
      password,
      repeatPassword: withRepeatPassword ? repeatPassword : undefined,
    });
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>{title}</h1>

      <label>
        Логин
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Введите логин..."
          autoComplete="username"
          required
        />
      </label>

      <label>
        Пароль
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Введите пароль..."
          type="password"
          autoComplete={withRepeatPassword ? "new-password" : "current-password"}
          required
        />
      </label>

      {withRepeatPassword && (
        <label>
          Повторите пароль
          <input
            value={repeatPassword}
            onChange={(event) => setRepeatPassword(event.target.value)}
            placeholder="Повторите пароль..."
            type="password"
            autoComplete="new-password"
            required
          />
        </label>
      )}

      {error && <p className="auth-error">{error}</p>}

      <button disabled={loading}>{loading ? loadingText : submitText}</button>

      <p className="auth-footer">{footer}</p>
    </form>
  );
}
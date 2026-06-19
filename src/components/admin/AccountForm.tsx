import { useState } from "react";
import type { FormEvent } from "react";
import { AxiosError } from "axios";

import { Field, TextInput, Status } from "./fields";
import { useChangePassword } from "../../hooks/auth/useChangePassword";

export function AccountForm() {
  const changePassword = useChangePassword();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [localError, setLocalError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError("");

    if (next.length < 6) {
      setLocalError("Новый пароль должен быть не короче 6 символов.");
      return;
    }
    if (next !== repeat) {
      setLocalError("Новый пароль и повтор не совпадают.");
      return;
    }

    changePassword.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => {
          setCurrent("");
          setNext("");
          setRepeat("");
        },
      },
    );
  }

  function serverError(): string {
    const err = changePassword.error;
    if (err instanceof AxiosError) {
      if (err.response?.status === 400) return "Текущий пароль введён неверно.";
      if (err.response?.status === 422) return "Новый пароль должен быть не короче 6 символов.";
    }
    return "Не удалось сменить пароль.";
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} style={{ maxWidth: 460 }}>
      <Field label="Текущий пароль" required full>
        <TextInput
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          autoComplete="current-password"
        />
      </Field>
      <Field label="Новый пароль" required full>
        <TextInput
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Минимум 6 символов"
        />
      </Field>
      <Field label="Повторите новый пароль" required full>
        <TextInput
          type="password"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          required
          autoComplete="new-password"
        />
      </Field>

      {localError && <Status kind="err">{localError}</Status>}
      {changePassword.isError && <Status kind="err">{serverError()}</Status>}
      {changePassword.isSuccess && <Status kind="ok">Пароль изменён.</Status>}

      <div className="admin-actions">
        <button className="admin-btn" type="submit" disabled={changePassword.isPending}>
          {changePassword.isPending ? "Сохраняем…" : "Сменить пароль"}
        </button>
      </div>
    </form>
  );
}

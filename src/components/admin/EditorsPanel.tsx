import { useState } from "react";
import type { FormEvent } from "react";
import { useAtomValue } from "jotai";
import { AxiosError } from "axios";

import { Field, TextInput, Status } from "./fields";
import { useUsers } from "../../hooks/auth/useUsers";
import { useCreateUser } from "../../hooks/auth/useCreateUser";
import { useDeleteUser } from "../../hooks/auth/useDeleteUser";
import { userAtom } from "../../store/authAtom";
import type { UserRole } from "../../types/auth/auth.types";

const ROLE_LABEL: Record<UserRole, string> = {
  superadmin: "Главный администратор",
  editor: "Редактор",
};

export function EditorsPanel() {
  const currentUser = useAtomValue(userAtom);
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("editor");
  const [deleteError, setDeleteError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createUser.mutate(
      { username, password, role },
      {
        onSuccess: () => {
          setUsername("");
          setPassword("");
          setRole("editor");
        },
      },
    );
  }

  function handleDelete(id: number, name: string) {
    if (!window.confirm(`Удалить пользователя «${name}»?`)) return;
    setDeleteError("");
    deleteUser.mutate(id, {
      onError: (e: unknown) => {
        const detail = e instanceof AxiosError ? e.response?.data?.detail : undefined;
        setDeleteError(typeof detail === "string" ? detail : "Не удалось удалить пользователя.");
      },
    });
  }

  return (
    <div>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-grid">
          <Field label="Логин" required>
            <TextInput value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="off" />
          </Field>
          <Field label="Пароль" required>
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </Field>
          <Field label="Роль" required>
            <select className="admin-select" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="editor">Редактор (только добавление)</option>
              <option value="superadmin">Главный администратор (полный доступ)</option>
            </select>
          </Field>
        </div>

        {createUser.isError && <Status kind="err">Не удалось создать пользователя (возможно, логин занят).</Status>}
        {createUser.isSuccess && <Status kind="ok">Пользователь создан.</Status>}

        <div className="admin-actions">
          <button className="admin-btn" type="submit" disabled={createUser.isPending}>
            {createUser.isPending ? "Создаём…" : "Создать пользователя"}
          </button>
        </div>
      </form>

      {deleteError && (
        <div style={{ marginTop: 16 }}>
          <Status kind="err">{deleteError}</Status>
        </div>
      )}

      {isLoading ? (
        <div className="admin-empty">Загружаем список…</div>
      ) : users && users.length ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Логин</th>
              <th>Роль</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{ROLE_LABEL[u.role] ?? u.role}</td>
                <td style={{ textAlign: "right" }}>
                  {currentUser?.id === u.id ? (
                    <span className="admin-record__sub">это вы</span>
                  ) : (
                    <button
                      className="admin-btn admin-btn--danger admin-btn--sm"
                      type="button"
                      onClick={() => handleDelete(u.id, u.username)}
                      disabled={deleteUser.isPending}
                    >
                      Удалить
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="admin-empty">Пользователей пока нет.</div>
      )}
    </div>
  );
}

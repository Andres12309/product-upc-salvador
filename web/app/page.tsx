'use client';

import { FormEvent, useEffect, useState } from 'react';
import { currentUser, login, type SessionUser } from '@/lib/session';
import { clearToken, readToken, saveToken } from '@/lib/token';

export default function Home() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const token = readToken();
    if (!token) {
      setReady(true);
      return;
    }
    currentUser(token)
      .then((session) => {
        if (!session) clearToken();
        setUser(session);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => setReady(true));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      const token = await login(username.trim(), password);
      saveToken(token);
      const session = await currentUser(token);
      if (!session) {
        clearToken();
        setError('La sesión no quedó activa.');
        return;
      }
      setUser(session);
      setPassword('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión');
    } finally {
      setPending(false);
    }
  }

  function logout() {
    clearToken();
    setUser(null);
    setUsername('');
  }

  if (!ready) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 text-zinc-600">
        Cargando sesión…
      </main>
    );
  }

  if (user) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-6 py-16">
        <p className="text-sm font-medium tracking-wide text-zinc-500">Catálogo de productos</p>
        <h1 className="text-3xl font-semibold tracking-tight">Sesión iniciada</h1>
        <p className="text-lg text-zinc-700">
          {user.username}
          <span className="mt-2 block text-base text-zinc-500">Rol: {user.role}</span>
        </p>
        <p className="text-zinc-600">
          El catálogo se carga en la siguiente historia. Esta pantalla solo confirma el acceso.
        </p>
        <button
          type="button"
          onClick={logout}
          className="h-11 w-fit rounded-full bg-zinc-900 px-5 text-sm font-medium text-white"
        >
          Cerrar sesión
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium tracking-wide text-zinc-500">Catálogo de productos</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Iniciar sesión</h1>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Usuario
          <input
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="h-11 rounded-lg border border-zinc-300 px-3 font-normal"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Contraseña
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-lg border border-zinc-300 px-3 font-normal"
            required
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 h-11 rounded-full bg-zinc-900 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}

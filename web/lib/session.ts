export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export type SessionUser = {
  id: string;
  username: string;
  role: 'admin' | 'manager';
};

function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && typeof message[0] === 'string') return message[0];
  }
  return fallback;
}

export async function login(username: string, password: string): Promise<string> {
  const params = new URLSearchParams({ username, password });
  const response = await fetch(`${API_URL}/auth/login?${params.toString()}`);
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(errorMessage(body, 'No se pudo iniciar sesión'));
  }
  if (!body || typeof body !== 'object' || !('accessToken' in body) || typeof body.accessToken !== 'string') {
    throw new Error('La API no devolvió un token');
  }
  return body.accessToken;
}

export async function currentUser(token: string): Promise<SessionUser | null> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 401) return null;
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(errorMessage(body, 'No se pudo leer la sesión'));
  }
  return body as SessionUser;
}

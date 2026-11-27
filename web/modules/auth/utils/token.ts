const KEY = 'accessToken';

export function readToken(): string | null {
  return localStorage.getItem(KEY);
}

export function saveToken(token: string): void {
  localStorage.setItem(KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(KEY);
}

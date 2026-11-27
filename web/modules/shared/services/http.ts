import axios, { isAxiosError } from 'axios';
import { readToken } from '@/modules/auth/utils/token';

type ApiBody = { message?: string | string[] };

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
});

http.interceptors.request.use((config) => {
  const secret = process.env.NEXT_PUBLIC_JWT_SECRET;
  if (secret) config.headers['X-Jwt-Secret'] = secret;
  if (typeof window === 'undefined') return config;
  const token = readToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiError(error: unknown, fallback: string): string {
  if (isAxiosError<ApiBody>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && typeof message[0] === 'string') return message[0];
  }
  return fallback;
}

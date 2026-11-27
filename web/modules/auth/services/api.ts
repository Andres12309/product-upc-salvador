import { isAxiosError } from 'axios';
import { apiError, http } from '@/modules/shared/services/http';
import type { SessionUser } from '../types';

export async function login(username: string, password: string): Promise<string> {
  try {
    const { data } = await http.get<{ accessToken?: string }>('/auth/login', {
      params: { username, password },
    });
    if (!data.accessToken) throw new Error('La API no devolvió un token');
    return data.accessToken;
  } catch (error) {
    if (error instanceof Error && error.message === 'La API no devolvió un token') throw error;
    throw new Error(apiError(error, 'No se pudo iniciar sesión'));
  }
}

export async function currentUser(): Promise<SessionUser | null> {
  try {
    const { data } = await http.get<SessionUser>('/auth/me');
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) return null;
    throw new Error(apiError(error, 'No se pudo leer la sesión'));
  }
}

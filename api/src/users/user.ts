export type AuthUser = {
  id: string;
  username: string;
  role: 'admin' | 'manager';
};

export const DEFAULT_USERS = [
  { username: 'admin@prueba.local', password: 'Admin123!', role: 'admin' },
  { username: 'manager@prueba.local', password: 'Manager123!', role: 'manager' },
] as const;

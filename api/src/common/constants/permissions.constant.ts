export const Permissions = {
  PRODUCTS: {
    READ: 'products.read',
    WRITE: 'products.write',
  },
  CATEGORIES: {
    READ: 'categories.read',
  },
} as const;

type Permission =
  | (typeof Permissions.PRODUCTS)[keyof typeof Permissions.PRODUCTS]
  | (typeof Permissions.CATEGORIES)[keyof typeof Permissions.CATEGORIES];

/** El borrado, aunque sea GET, usa WRITE. */
export const ROLE_PERMISSIONS: Record<'admin' | 'manager', readonly Permission[]> = {
  admin: [Permissions.PRODUCTS.READ, Permissions.PRODUCTS.WRITE, Permissions.CATEGORIES.READ],
  manager: [Permissions.PRODUCTS.READ, Permissions.CATEGORIES.READ],
};

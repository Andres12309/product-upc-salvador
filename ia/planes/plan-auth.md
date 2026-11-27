# Acceso y tablas

Este paso deja el acceso funcionando y las tablas vacías del catálogo, para que la historia 1 solo cargue datos.

## Tablas

`user`

| Columna | Uso |
|---|---|
| `id` | UUID. Va en el `sub` del token. |
| `username` | Único. Es el usuario del login (`admin@prueba.local`). |
| `passwordHash` | Hash scrypt. No hay columna de contraseña en claro. |
| `role` | `admin` o `manager`. |
| `createdAt`, `updatedAt` | UTC. |

`category`: `id`, `code` único. Sin nombre, porque el CSV no lo trae.

`subcategory`: `id`, `code` único en todo el catálogo, `categoryId`. El código único impide que la misma subcategoría cuelgue de dos categorías.

`product`: `id` propio (el `Id` del CSV no se guarda), `upcCode` `varchar(12)` único, `upcDescription`, `subcategoryId`, `dateAdded`, `updatedDate`, `addedBy`, `modifiedBy`. Esos dos últimos son texto: en el archivo son usuarios que no inician sesión.

## Acceso

- Login: `GET /auth/login?username=&password=`. El query es `LoginQueryDto` y la respuesta es `LoginResponseDto` (`{ accessToken }`). `GET /auth/me` responde `SessionUserDto`, armado por `AuthMapper`.
- El token es HS256, lleva `sub`, `username` y `role`, y vence con `JWT_EXPIRES_IN` (1 hora).
- `JWT_SECRET` es el del `.env` entregado (`cambia-este-secreto`). Se usa tal cual. Queda corto para el firmador de `@nestjs/authentication`, así que firma `@nestjs/jwt`.
- `X-Jwt-Secret` no se lee. El header se permite en CORS para que el navegador no lo bloquee si alguien lo manda.
- Consultas: `Authorization: Bearer`. Alta y edición: campo `token` en el body; si no viene, también vale el header. El borrado será un GET, así que usará el header.
- Sin token o con uno inválido: 401. Manager en una ruta `products.write`: 403.
- `GET /auth/me` devuelve el usuario cargado de la base, sin el hash. El Front lo usa al recargar. Cualquier sesión válida entra: no pide un permiso de catálogo.
- `npm run db:seed` abre la base y llama a `ensureDefaultUsers()` del módulo `users`. La historia 1 llama a esa misma función. Si el usuario ya existe, el hash no cambia. Auth importa ese módulo para buscar la cuenta en el login.
- `Permissions` y `ROLE_PERMISSIONS` están en `common/constants`. Las rutas de productos y categorías llevarán `@RequirePermissions`. El borrado, aunque sea GET, lleva `products.write`.

## Front

El token queda en `localStorage` con la clave `accessToken`. La pantalla de inicio pide usuario y contraseña, muestra el rol y cierra sesión. Todavía no hay catálogo.

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
- El token es HS256, lleva `sub`, `username` y `role`, y no vence. La historia 3 pide que no expire.
- `JWT_SECRET` es el del `.env` entregado (`cambia-este-secreto`, 19 bytes, sin relleno). Queda corto para el firmador de `@nestjs/authentication`, así que firma `@nestjs/jwt`.
- El front guarda ese valor en `NEXT_PUBLIC_JWT_SECRET` y lo manda en `X-Jwt-Secret` en cada petición, incluido el login. La API firma y verifica con ese header. Sin el header, el login válido responde 401 «Falta el secreto».
- CORS refleja cualquier origen. El header `X-Jwt-Secret` sigue permitido.
- Consultas GET: `Authorization: Bearer`. Crear, editar y eliminar: campo `token` en el body. El borrado es GET y también manda ese campo; si no llega, vale el header.
- Sin token o con uno inválido: 401. Manager en una ruta `products.write`: 403.
- `GET /auth/me` devuelve el usuario cargado de la base, sin el hash. El Front lo usa al recargar. Cualquier sesión válida entra: no pide un permiso de catálogo.
- `npm run db:seed` abre la base y llama a `ensureDefaultUsers()` del módulo `users`. La historia 1 llama a esa misma función. Si el usuario ya existe, el hash no cambia. Auth importa ese módulo para buscar la cuenta en el login.
- `Permissions` y `ROLE_PERMISSIONS` están en `common/constants`. Las rutas de productos y categorías llevarán `@RequirePermissions`. El borrado, aunque sea GET, lleva `products.write`.

## Front

El token queda en `localStorage` con la clave `accessToken`. La pantalla de inicio pide usuario y contraseña, muestra el rol y cierra sesión. Todavía no hay catálogo.

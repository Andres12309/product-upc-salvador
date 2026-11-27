# Uso de IA

Herramienta: Cursor. El apunte de esta entrega está en [prompts/2026-11-27.md](prompts/2026-11-27.md). El orden de lo que falta está en [planes/plan-inicial.md](planes/plan-inicial.md).

## Qué entra en el commit

Acceso listo, carga del CSV en `POST /load` y consulta de una categoría. El listado de productos todavía no.

- Login `GET /auth/login`. Respuesta `{ accessToken }`. El 401 dice «El usuario no existe» o «La contraseña es incorrecta».
- Token HS256 con `sub`, `username` y `role`. Firma `@nestjs/jwt` con `JWT_SECRET` tal como viene en `.env`. Vence según `JWT_EXPIRES_IN`.
- Contraseña con hash scrypt (`PasswordHasher`). No hay clave en claro.
- Dos guards: el primero exige un token válido y carga el usuario de la base; el segundo mira `@RequirePermissions` contra `ROLE_PERMISSIONS`. Admin lee y escribe. Manager solo lee. Sin token: 401. Sin permiso: 403.
- `GET /auth/me` pide sesión y no pide un permiso de catálogo. El front lo usa al recargar.
- En POST, PUT y PATCH el token puede ir en el body. En el resto va en `Authorization: Bearer`.
- `npm run db:seed` abre la base y llama a `ensureDefaultUsers()` en el módulo `users`. Crea `admin@prueba.local` / `Admin123!` y `manager@prueba.local` / `Manager123!` si no existen. No reescribe un hash ya guardado. La historia 1 usa esa misma función.
- Un error desconocido responde 500 con «Error interno del servidor», sin stack ni SQL.
- Entrada y salida del login pasan por DTO y `AuthMapper`.

## Decisiones que el código ya cumple

1. `upcCode` es texto de 12 caracteres. `010433218194` y `10433218194` son productos distintos.
2. `POST /load` no pide token. Recorta espacios, pasa códigos a mayúsculas y omite la fila idéntica. Una fila dudosa se guarda con `needsAttention` (UPC que no son 12 dígitos, campos vacíos, fecha rara, coma sin comillas o subcategoría de otra categoría). El mismo UPC con otros datos no crea un segundo producto: el aviso queda en el que ya existe. El `Id` del CSV no es llave. `GET /categories/:categoryCode/subcategories` pide `categories.read`.
3. `addedBy` y `modifiedBy` son texto. El CSV trae autores que no inician sesión.
4. El front guarda el token en `localStorage` (`accessToken`). No conoce `JWT_SECRET`.
5. Pruebas con Vitest. Login, 401 y 403 ya están. Las reglas del producto esperan al CRUD.

## Fuera de este paso

Paginación, buscador, Swagger, colas, refresh tokens, tablas de permisos, Docker de la API y del front, panel de usuarios y CRUD de categorías.

# Uso de IA

Herramienta: Cursor. El apunte de esta entrega está en [prompts/2026-11-27.md](prompts/2026-11-27.md). El orden de lo que falta está en [planes/plan-inicial.md](planes/plan-inicial.md).

## Qué entra en el commit

Acceso listo y tablas del catálogo vacías. La historia 1 solo carga el CSV.

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
2. La carga (historia 1) recorta espacios, pasa códigos a mayúsculas, omite la fila idéntica, no inserta un segundo producto si el UPC ya existe con otros datos, y rechaza UPC que no sea 12 dígitos, campos vacíos y una subcategoría de otra categoría. El `Id` del CSV no es llave.
3. `addedBy` y `modifiedBy` son texto. El CSV trae autores que no inician sesión.
4. El front guarda el token en `localStorage` (`accessToken`). No conoce `JWT_SECRET`.
5. Pruebas con Vitest. Login, 401 y 403 ya están. Las reglas del producto esperan al CRUD.

## Fuera de este paso

Paginación, buscador, Swagger, colas, refresh tokens, tablas de permisos, Docker de la API y del front, panel de usuarios y CRUD de categorías.

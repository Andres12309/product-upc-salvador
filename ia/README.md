# Uso de IA

Herramienta: Cursor. El apunte de esta entrega está en [prompts/2026-11-27.md](prompts/2026-11-27.md). El orden de lo que falta está en [planes/plan-inicial.md](planes/plan-inicial.md).

## Qué entra en el commit

Acceso listo, carga del CSV y CRUD de productos en la API y en el Front.

- Login `GET /auth/login`. Respuesta `{ accessToken }`. El 401 dice «El usuario no existe» o «La contraseña es incorrecta».
- Token HS256 con `sub`, `username` y `role`. La API lo firma con el `X-Jwt-Secret` que manda el front (`NEXT_PUBLIC_JWT_SECRET`, el mismo valor que `JWT_SECRET`). No lleva `exp`.
- Contraseña con hash scrypt (`PasswordHasher`). No hay clave en claro.
- Dos guards: el primero exige un token válido y carga el usuario de la base; el segundo mira `@RequirePermissions` contra `ROLE_PERMISSIONS`. Admin lee y escribe. Manager solo lee. Sin token: 401. Sin permiso: 403.
- `GET /auth/me` pide sesión y no pide un permiso de catálogo. El front lo usa al recargar.
- En los GET de consulta el token va en `Authorization: Bearer`. En crear, editar y eliminar va en el campo `token` del body. El borrado es `GET /products/:id/delete` y, por ser eliminar, también manda ese campo. Si el body no trae token, la API acepta el header.
- `npm run db:seed` abre la base y llama a `ensureDefaultUsers()` en el módulo `users`. Crea `admin@prueba.local` / `Admin123!` y `manager@prueba.local` / `Manager123!` si no existen. No reescribe un hash ya guardado. La historia 1 usa esa misma función.
- Un error desconocido responde 500 con «Error interno del servidor», sin stack ni SQL.
- Entrada y salida del login pasan por DTO y `AuthMapper`.

## Decisiones que el código ya cumple

1. `upcCode` es texto de 12 caracteres. `010433218194` y `10433218194` son productos distintos.
2. `POST /load` no pide token. Recorta espacios, pasa códigos a mayúsculas y omite la fila idéntica. Una fila dudosa se guarda con `needsAttention` (UPC que no son 12 dígitos, campos vacíos, fecha rara, coma sin comillas o subcategoría de otra categoría). El mismo UPC con otros datos no crea un segundo producto: el aviso queda en el que ya existe. El `Id` del CSV no es llave. `GET /categories` y `GET /categories/:categoryCode/subcategories` piden `categories.read`.
3. El CRUD de productos exige UPC de 12 dígitos, categoría y subcategoría de esa categoría. El UPC repetido responde 409. Un id desconocido responde 404. El borrado es `GET /products/:id/delete`. Un guardado válido limpia `needsAttention`. El 500 de un error desconocido no incluye SQL ni stack.
4. `addedBy` y `modifiedBy` son texto. El CSV trae autores que no inician sesión. En el formulario se guardan tal como se ven.
5. El front guarda el token en `localStorage` (`accessToken`) y manda `X-Jwt-Secret` en cada petición. La API acepta cualquier origen. La interfaz usa Material UI solo en tema claro, Axios y `useForm`. Los módulos son `auth`, `catalog`, `shell` y `shared`. Dentro de cada uno van `components`, `hooks`, `services`, `utils` y `types`, según lo que use. `shared` tiene el cliente Axios y el tema. El header enlaza `/productos` y `/categorias`. Ver un producto o una categoría cambia de ruta, así el atrás del navegador vuelve. Alta, edición y borrado son diálogos y dejan `?accion=` en la URL para que el atrás los cierre.
6. Pruebas con Vitest. Login, 401, 403 y el CRUD de productos ya tienen prueba.

## Fuera de este paso

Paginación, buscador, Swagger, colas, refresh tokens, tablas de permisos, Docker de la API y del front, panel de usuarios y CRUD de categorías.

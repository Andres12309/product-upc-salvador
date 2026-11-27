# Historia 3 — autenticación

El acceso que se armó antes de la historia 1 queda alineado con el enunciado. Las tablas y el hash siguen en [plan-auth.md](plan-auth.md).

## Login

- `GET /auth/login?username=&password=` con el header `X-Jwt-Secret`.
- Credenciales válidas: `{ accessToken }`. El JWT es HS256, lo firma el secreto de ese header y lleva `sub`, `username` y `role`. No tiene `exp`.
- Sin el header, un login válido responde 401 «Falta el secreto».
- Usuario desconocido: 401 «El usuario no existe». Contraseña mala: 401 «La contraseña es incorrecta». La verificación del hash ocurre antes de mirar el secreto, así esos dos mensajes no se mezclan.
- El secreto es `cambia-este-secreto` (19 bytes, sin relleno). El front lo tiene en `NEXT_PUBLIC_JWT_SECRET` y lo manda en cada petición, incluido el login. `JWT_SECRET` del `.env` es el mismo valor; la firma de cada request usa el header, no un vencimiento del servidor.
- La contraseña sigue en hash scrypt. Esta historia no pide leerla en claro.

## Sesión

- El token se guarda en `localStorage` con la clave `accessToken`.
- `GET /auth/me` recarga el usuario desde la base, sin el hash, y no pide un permiso de catálogo.
- Sin token: 401 «Falta el token». Token inválido o secreto distinto al de la firma: 401 «Token inválido o vencido». Sin el header en una ruta protegida: 401 «Falta el secreto».
- Cerrar sesión borra el token y vuelve a `/login`.

## Dónde viaja el token

La nota de la sección 9 separa el secreto del token de sesión.

- `X-Jwt-Secret` va en todas las peticiones del front.
- Consultas GET (`/products`, `/products/:id`, `/categories`, `/categories/:categoryCode/subcategories`, `/auth/me`): `Authorization: Bearer`.
- Crear (`POST /products`) y editar (`PUT /products/:id`): el campo `token` va en el body con los demás campos.
- Eliminar es `GET /products/:id/delete`. Por ser GET también lleva `Authorization`. Por ser eliminar también manda `{ token }` en el body. Si ese body no llega, la API acepta el header.

## Roles y origen

- Admin consulta, crea, edita y elimina. Manager solo consulta. Una escritura del manager responde 403.
- CORS refleja el origen de la petición y permite `Authorization`, `Content-Type` y `X-Jwt-Secret`.

## Cuentas

`admin@prueba.local` / `Admin123!` (admin) y `manager@prueba.local` / `Manager123!` (manager). `ensureDefaultUsers()` no reescribe un hash que ya existe.

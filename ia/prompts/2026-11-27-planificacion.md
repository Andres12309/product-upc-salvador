# Cursor — 27 nov

Le pedí revisar el PDF contra el CSV y decir el orden, sin armar el proyecto.

Me quedé con esto:
- UPC como texto. La fila 102 es `010433218194` y la 103 es `10433218194`. Como número quedan iguales.
- El secreto JWT se queda en el servidor. El `.env` ya trae `JWT_EXPIRES_IN=1h`.
- Contraseñas con hash.
- Un solo repo, carpetas `api` y `web`.

El orden está en `ia/planes/plan-inicial.md`.

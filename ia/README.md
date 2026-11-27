# Uso de IA

Herramienta: Cursor, el 27 de noviembre de 2026. Los pedidos están en [prompts/2026-11-27.md](prompts/2026-11-27.md). Los planes están en [planes/](planes/).

## Qué se aceptó

- NestJS, Prisma, DTO y mappers. Los recursos nuevos salen con el CLI de Nest.
- `POST /load` sin token. Una fila dudosa se guarda con `needsAttention`. El mismo UPC con otros datos no crea un segundo producto.
- El JWT es HS256, lleva el rol y no vence. La API lo firma y lo verifica con el `X-Jwt-Secret` que manda el front.
- En los GET de consulta el token va en `Authorization: Bearer`. En crear, editar y eliminar va en el campo `token`. El borrado es `GET /products/:id/delete` y, por ser eliminar, también manda ese campo.
- El manager ve el mismo listado y el mismo detalle. No ve crear, editar ni eliminar, y la API responde 403.
- `GET /health` es público. Al cambiar la categoría, el formulario vacía la subcategoría y carga solo las de esa categoría.
- Un error no previsto responde 500 con el mensaje técnico y el stack en `detail`.

## Qué se cambió respecto al enunciado

- El UPC es texto de 12 caracteres. `010433218194` y `10433218194` siguen siendo distintos.
- La contraseña queda en hash scrypt. La base no guarda `Admin123!` en claro. `ensureDefaultUsers` no reescribe un hash ya guardado.
- Las pruebas usan Vitest (`npm test` y `npm run test:e2e`). Nest 12 es ESM y Jest no levanta esta API. Cubren campos obligatorios, UPC único, login y permisos por rol.

## Qué se descartó

Paginación, buscador, Swagger, colas, refresh tokens, tablas de permisos, Docker del front, panel de usuarios y CRUD de categorías y subcategorías. El contenedor de la API sí quedó, solo como healthcheck, en el perfil `api`.

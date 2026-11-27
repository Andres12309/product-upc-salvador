# Historias extra

## E1 — pruebas

El comando está en el README: desde `api`, `npm test` corre las unitarias y `npm run test:e2e` las de extremo a extremo. El motor es Vitest. Nest 12 es ESM y Jest no levanta esta API; las pruebas usan `describe`, `it` y `expect`.

Cubren campos obligatorios del producto, UPC repetido, login (usuario, contraseña y secreto) y permisos: el manager lee y el admin escribe.

## E2 — salud

`GET /health` es público. Responde `{ status, api, database }`. Si la base no responde, el estado es 503 y `database` queda `down`. El servicio `api` de `docker-compose.yml` usa esa ruta como healthcheck y vive en el perfil `api`, para que `docker compose up -d` siga levantando solo la base. El `JWT_SECRET` del contenedor sale del `.env`. No hay que levantar `npm run start:dev` a la vez que ese perfil: los dos ocupan el puerto 3000.

## E3 — categoría y subcategoría

Al cambiar la categoría se vacía la subcategoría elegida y la lista anterior, y se cargan solo las subcategorías de la categoría nueva.

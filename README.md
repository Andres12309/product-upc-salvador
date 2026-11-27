# Catálogo de Productos UPC

API en NestJS y Front en Next.js sobre el PostgreSQL de este repositorio. Las decisiones de diseño están en [`ia/README.md`](ia/README.md).

## Requisitos

- Node.js 22
- Docker con Compose v2

## Base de datos

El archivo `.env` ya está en la raíz.

```bash
docker compose up -d
docker compose ps
```

El servicio `db` debe quedar `healthy`.

```bash
docker exec -it prueba-upc-db psql -U prueba -d productos_upc -c "select 1"
```

Conexión: `postgresql://prueba:prueba123@localhost:5432/productos_upc`

Adminer, opcional:

```bash
docker compose --profile tools up -d
```

http://localhost:8080 — sistema PostgreSQL, servidor `db`, usuario `prueba`, contraseña `prueba123`, base `productos_upc`.

Para borrar los datos y empezar de cero: `docker compose down -v`.

## API

Puerto 3000.

```bash
cd api
npm install
npm run db:deploy
npm run db:seed
npm run start:dev
```

`db:deploy` aplica la migración. `db:seed` crea `admin@prueba.local` / `Admin123!` y `manager@prueba.local` / `Manager123!` si todavía no existen. El login es `GET /auth/login`.

## Carga inicial

Con la API en marcha, desde `api`:

```bash
npm run load
```

No pide token. Lee `data/productos.csv`, crea categorías, subcategorías y productos, y devuelve cuántos cargó, cuántos omitió y cuántos quedaron para revisión. Una fila dudosa se guarda con `needsAttention`; no se tira. El mismo UPC con otros datos no crea un segundo producto: el aviso queda en el que ya existe. Se puede ejecutar otra vez: no duplica. También asegura las dos cuentas de prueba.

`GET /categories/:categoryCode/subcategories` pide el token y devuelve la categoría, sus subcategorías con productos, y los productos sin subcategoría.

## Productos

Con sesión. El listado y el detalle los ven admin y manager. Crear, editar y borrar solo el admin.

- `GET /products` y `GET /products/:id`
- `POST /products` y `PUT /products/:id`, con el token en el body
- `GET /products/:id/delete`
- `GET /categories` para las listas del formulario

El UPC nuevo tiene 12 dígitos y es único. La subcategoría tiene que pertenecer a la categoría. Las fechas viajan en UTC, por ejemplo `2026-01-15T14:30:00Z`.

## Front

Puerto 3001.

```bash
cd web
npm install
npm run dev
```

## Estado

La base, el acceso, la carga del CSV y el CRUD de productos ya están. El Front inicia sesión y reparte el catálogo en `/productos`, `/productos/:id`, `/categorias` y `/categorias/:code`. Alta, edición y borrado se abren en diálogo. Lo que falta sigue el orden de [`ia/planes/plan-inicial.md`](ia/planes/plan-inicial.md).

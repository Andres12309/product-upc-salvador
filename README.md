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

## Front

Puerto 3001.

```bash
cd web
npm install
npm run dev
```

## Estado

La base, el esquema y el acceso ya están. El Front inicia sesión y guarda el token. La carga del CSV y el catálogo siguen el orden de [`ia/planes/plan-inicial.md`](ia/planes/plan-inicial.md).

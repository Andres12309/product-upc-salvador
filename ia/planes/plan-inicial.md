# Plan inicial

Cada número es un paso cerrado y comprobable antes de empezar el siguiente.

1. Repositorio único, PostgreSQL del compose, `.env`, CSV y esta carpeta `ia/`. Hecho.
2. Esquema Prisma, hash de contraseñas, JWT, roles y login del Front. Hecho. El detalle está en [plan-auth.md](plan-auth.md).
3. Historia 1: `POST /load`, resumen, filas para revisión e idempotencia. `GET /categories/:categoryCode/subcategories` ya devuelve la jerarquía. Hecho. El detalle está en [plan-hu01.md](plan-hu01.md).
4. Historia 2: listado, detalle, alta, edición y borrado, en la API y en el Front. Hecho. El detalle está en [plan-hu02.md](plan-hu02.md).
5. README de entrega: cómo levantar todo, la carga, credenciales y supuestos.
6. Si queda tiempo: `GET /health`. Las reglas de producto y el login ya tienen prueba e2e.

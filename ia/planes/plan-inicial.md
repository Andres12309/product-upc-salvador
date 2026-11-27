# Plan inicial

Cada número es un paso cerrado y comprobable antes de empezar el siguiente.

1. Repositorio único, PostgreSQL del compose, `.env`, CSV y esta carpeta `ia/`. Hecho.
2. Esquema Prisma, hash de contraseñas, JWT, roles y login del Front. Hecho. El detalle está en [plan-auth.md](plan-auth.md).
3. Historia 1: `POST /load`, resumen, filas para revisión e idempotencia. `GET /categories/:categoryCode/subcategories` ya devuelve la jerarquía. Hecho. El detalle está en [plan-hu01.md](plan-hu01.md).
4. Consultas de productos: listado y detalle.
5. Alta, edición y borrado, con campos obligatorios, UPC único y subcategoría de esa categoría. `read` para consultar y `write` para cambiar.
6. Front: listado y detalle. La sesión ya sobrevive a recargar.
7. Front: formulario, borrado con confirmación y botones ocultos para el manager.
8. README de entrega: cómo levantar todo, la carga, credenciales y supuestos.
9. Pruebas de campos obligatorios y UPC único. Login, 401 y 403 ya tienen prueba. Después, si queda tiempo, `GET /health`.

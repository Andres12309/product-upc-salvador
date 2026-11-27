# Plan inicial

Cada número es un paso cerrado y comprobable antes de empezar el siguiente.

1. Repositorio único, PostgreSQL del compose, `.env`, CSV y esta carpeta `ia/`. Hecho.
2. Esquema Prisma, hash de contraseñas, JWT, roles y login del Front. Hecho. El detalle está en [plan-auth.md](plan-auth.md).
3. Historia 1: carga del CSV, resumen e idempotencia. Segunda ejecución sin duplicar. La carga llama a `ensureDefaultUsers()`.
4. Consultas: productos, detalle, categorías y subcategorías de una categoría.
5. Alta, edición y borrado, con campos obligatorios, UPC único y subcategoría de esa categoría. `read` para consultar y `write` para cambiar.
6. Front: listado y detalle. La sesión ya sobrevive a recargar.
7. Front: formulario, borrado con confirmación y botones ocultos para el manager.
8. README de entrega: cómo levantar todo, la carga, credenciales y supuestos.
9. Pruebas de campos obligatorios y UPC único. Login, 401 y 403 ya tienen prueba. Después, si queda tiempo, `GET /health`.

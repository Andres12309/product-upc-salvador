# Plan inicial

Cada número es un paso cerrado y comprobable antes de empezar el siguiente.

1. Repositorio único, PostgreSQL del compose, `.env`, CSV y esta carpeta `ia/`. Sin tablas ni pantallas.
2. Esquema: `category`, `subcategory`, `product`, `user`, con migración.
3. Carga del CSV, resumen e idempotencia. Segunda ejecución sin duplicar.
4. Login, guard y roles. Comprobado con peticiones HTTP: token, 401 y 403.
5. Consultas: productos, detalle, categorías y subcategorías de una categoría.
6. Alta, edición y borrado, con campos obligatorios, UPC único y subcategoría de esa categoría.
7. Front: login, listado y detalle. La sesión sobrevive a recargar. Logout.
8. Front: formulario, borrado con confirmación y botones ocultos para el manager.
9. README de entrega: cómo levantar todo, la carga, credenciales y supuestos.
10. Solo con 1–9 listos: pruebas de campos obligatorios, UPC único, login y 403. Después, si queda tiempo, `GET /health`.

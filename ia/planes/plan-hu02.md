# Historia 2 — productos

La pantalla y la API viven juntas: listado, detalle, alta, edición y borrado.

- `GET /products` y `GET /products/:id` piden `products.read`. Admin y manager.
- `POST /products` y `PUT /products/:id` piden `products.write`. El token va en el body (`token`) y también sirve el header `Authorization`.
- `GET /products/:id/delete` pide `products.write`. El Front manda el campo `token` en el body, como en crear y editar, y también `Authorization` porque el método es GET.
- `GET /categories` lista los códigos para el formulario. Las subcategorías salen de `GET /categories/:categoryCode/subcategories`. Al cambiar la categoría se vacía la subcategoría.
- Alta y edición exigen nombre, UPC de 12 dígitos, categoría, subcategoría, las dos fechas en UTC (`2026-01-15T14:30:00Z`) y los dos autores. La subcategoría tiene que ser de esa categoría. El UPC repetido responde 409 «El UPC ya existe.» Un id que no existe responde 404 «No existe el producto.»
- El Front revisa el UPC contra el listado antes de enviar. Lo que se ve en las fechas y los autores es lo que se guarda.
- Un guardado válido limpia `needsAttention`.
- El manager no ve crear, editar ni eliminar. Un error no previsto responde 500 con el mensaje técnico y el stack en `detail`.
- El listado está en `/productos`, el detalle en `/productos/:id` y las categorías en `/categorias` y `/categorias/:code`. Esas rutas van en el header. Nuevo, editar y eliminar se abren en diálogo (`?accion=`).

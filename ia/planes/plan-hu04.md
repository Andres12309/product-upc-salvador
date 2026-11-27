# Historia 4 — consulta del manager

El manager revisa el catálogo con los mismos GET que el admin. No puede crear, editar ni eliminar, ni en la pantalla ni llamando a la API.

- `GET /products` y `GET /products/:id` piden `products.read`. El manager lo tiene. El listado muestra nombre, UPC, categoría, subcategoría, fecha de alta y fecha de modificación. El detalle muestra esos campos, quién registró, quién modificó y el aviso de atención cuando existe.
- `POST /products`, `PUT /products/:id` y `GET /products/:id/delete` piden `products.write`. El manager no lo tiene: la API responde 403 «No tiene permiso para esta acción».
- En el front, Nuevo, Editar y Eliminar solo se pintan si el rol es `admin`. Una URL con `?accion=nuevo`, `editar` o `eliminar` tampoco abre esos diálogos para el manager. Ver sigue disponible y lleva a `/productos/:id`.

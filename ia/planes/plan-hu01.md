# Historia 1 — carga

`POST /load` es público. Desde `api`, `npm run load` llama a ese endpoint. Lee `data/productos.csv` desde la raíz del repo.

Una fila queda insertada, omitida o marcada con `needsAttention`. No se descarta el registro.

- se recortan espacios y los códigos pasan a mayúsculas;
- el UPC de 12 dígitos se guarda limpio (`010433218194` conserva el cero);
- si el UPC no tiene 12 dígitos pero cabe en la columna (`10433218194`, `4.24E+11`, la letra O), se guarda y queda para revisión;
- faltan nombre, categoría o subcategoría: se guarda y queda para revisión. Sin subcategoría, `categoryId` conserva la categoría declarada y el producto no entra en ninguna subcategoría;
- una coma sin comillas que desplaza las columnas se recompone (`Cereal Maíz Azucarado 500g, Pack 2`) y queda para revisión. Una coma entre comillas no se toca;
- una fecha `dd/mm/aaaa hh:mm` se pasa a UTC y queda para revisión. Una fecha imposible (`2026-02-30`) se deja vacía y queda para revisión;
- si una subcategoría aparece en dos categorías, el producto se cuelga de la del prefijo (`LAC-LEC` es de `LAC`) y queda para revisión;
- la copia exacta se omite;
- el mismo UPC con otros datos no crea otro producto. El aviso, con el otro nombre, queda en el producto que ya estaba;
- el `Id` del CSV no se guarda.

`GET /categories/:categoryCode/subcategories` pide `categories.read`. Devuelve la categoría, sus subcategorías con los productos, y `pending` con los productos que no tienen subcategoría.

La carga llama a `ensureDefaultUsers()`. La segunda ejecución crea cero filas nuevas.

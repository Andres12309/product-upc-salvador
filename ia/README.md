# Uso de IA

Herramienta: Cursor. La usé para revisar el PDF contra el CSV y ordenar el trabajo. El apunte de esa sesión está en [prompts/2026-11-27-planificacion.md](prompts/2026-11-27-planificacion.md).

## Qué se aceptó del enunciado

- Un solo repositorio con NestJS (`api/`, puerto 3000), Next.js (`web/`, puerto 3001) y el PostgreSQL del `docker-compose.yml` entregado.
- Rutas y códigos de estado: login por `GET /auth/login`, consultas con `Authorization: Bearer`, alta y edición con `token` en el body, borrado con `GET /products/:id/delete`.
- Roles `admin` (consulta y escritura) y `manager` (solo GET). Sin token: 401. Manager escribiendo: 403.
- El 401 de login distingue usuario inexistente y contraseña incorrecta, porque el criterio de aceptación lo pide.
- El token de sesión se guarda en `localStorage`.
- La API acepta el origen del Front local.
- La carga es repetible y devuelve un resumen. El `.env` se versiona para que el proyecto levante sin configurar nada.

## Decisiones

1. Tablas: `category`, `subcategory`, `product` y `user`. No hay CRUD de categorías ni administración de usuarios.
2. `upcCode` es `varchar(12)` y único. En el CSV, `010433218194` y `10433218194` son productos distintos; guardarlos como número los fusiona y borra el cero inicial.
3. La carga crea categorías y subcategorías solo desde filas válidas, y siempre crea `admin@prueba.local` / `Admin123!` y `manager@prueba.local` / `Manager123!`.
4. Cada fila del CSV queda en el resumen como insertada, omitida o rechazada, con motivo. No se insertan duplicados para “no perder” una fila.
5. Reglas de la carga:
   - se recortan espacios;
   - códigos de categoría y subcategoría se guardan en mayúsculas;
   - una fila repetida idéntica se omite;
   - el mismo UPC con otros datos no crea otro producto: cuenta como conflicto;
   - se rechaza un UPC que, ya recortado, no tenga exactamente 12 dígitos (notación científica, letra O, texto);
   - se rechaza nombre, categoría o subcategoría vacíos;
   - se rechaza una subcategoría que en el archivo pertenece a otra categoría;
   - el `Id` del CSV no es llave.
6. Las contraseñas se guardan con hash. El login usa las claves publicadas. Soporte reinicia una clave; no la lee en la base.
7. `JWT_SECRET` vive solo en el servidor. El header `X-Jwt-Secret` no firma ni valida el token. El token expira según `JWT_EXPIRES_IN` (1 hora en `.env`).
8. En el borrado, que es un GET, el token va en `Authorization`. Un enlace no puede mandar body.
9. La API escribe `addedBy`, `modifiedBy` y las fechas UTC a partir del usuario del token. El formulario muestra esos valores; no los envía.
10. Los errores de negocio responden 400, 401, 403, 404 o 409 con un mensaje claro. Un 500 no incluye stack ni SQL.
11. El Front usa Tailwind y `fetch`. El formulario de producto filtra las subcategorías de la categoría elegida y limpia la selección al cambiarla.
12. Las pruebas, cuando se hagan, corren con `npm test` (Vitest, el que trae este NestJS). El enunciado menciona Jest.

## Qué queda fuera

Paginación, buscador, Swagger, colas, refresh tokens, un sistema genérico de permisos, Docker de la API y del Front, panel de usuarios y CRUD de categorías. Los extras del enunciado (pruebas, `/health` y el select dependiente) entran solo después de que la carga, el CRUD, el login y el Front funcionen. El select dependiente se hace dentro del formulario.

## Plan

El orden de trabajo está en [planes/plan-inicial.md](planes/plan-inicial.md).

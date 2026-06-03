// EFC: Este objeto se usará para devolver los resultados
// paginados de una consulta a la base de datos, es reutilizable para cualquier entidad. Contiene los siguientes campos:
// - data: un array con los resultados de la consulta para la página actual.
// - total: el número total de resultados para la consulta, sin paginar.
// - page: el número de página actual (empezando desde 1).
// - size: el número de resultados por página.

export interface PaginatedResult<T> {
  data: T[];

  total: number;

  page: number;

  size: number;
}

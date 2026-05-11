import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

// DTO base reutilizable para paginacion en listados CRUD.
export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un numero entero' })
  @Min(1, { message: 'page debe ser mayor o igual a 1' })
  page: number = 1;

  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un numero entero' })
  @Min(1, { message: 'limit debe ser mayor o igual a 1' })
  @Max(100, { message: 'limit debe ser menor o igual a 100' })
  limit: number = 10;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TerritorialScopeDto } from '../../common/dto/territorial-scope.dto';

export class ReclamoIdDto extends TerritorialScopeDto {
  @IsString()
  @IsNotEmpty({ message: 'id es obligatorio' })
  @IsUUID('4', { message: 'id debe ser un UUID v4 valido' })
  id!: string;
}

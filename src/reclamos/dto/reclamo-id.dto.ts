import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ReclamoIdDto {
  @IsString()
  @IsNotEmpty({ message: 'id es obligatorio' })
  @IsUUID('4', { message: 'id debe ser un UUID v4 valido' })
  id!: string;
}

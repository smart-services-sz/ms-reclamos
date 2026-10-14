import { IsString, IsUUID, MaxLength } from 'class-validator';
import { TerritorialScopeDto } from '../../common/dto/territorial-scope.dto';

export class CloseReclamoDto extends TerritorialScopeDto {
  @IsUUID('4')
  reclamoId!: string;

  @IsString()
  @MaxLength(2000)
  motivo!: string;

  @IsUUID('4')
  actorId!: string;
}

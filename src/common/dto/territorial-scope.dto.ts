import { IsOptional, IsString, Matches } from 'class-validator';

export class TerritorialScopeDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:_[a-z0-9]+)*$/)
  municipalityId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:_[a-z0-9]+)*$/)
  areaId?: string;
}
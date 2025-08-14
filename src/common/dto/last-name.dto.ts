import { IsString } from 'class-validator';

export class LastNameDto {
  @IsString()
  lastName: string;
}

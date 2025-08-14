import { IsString } from 'class-validator';

export class FirstNameDto {
  @IsString()
  firstName: string;
}

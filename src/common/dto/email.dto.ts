import { IsEmail } from 'class-validator';

export class EmailDto {
  @IsEmail()
  email: string;
}

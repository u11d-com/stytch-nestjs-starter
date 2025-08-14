import { IsString } from 'class-validator';

export class SessionTokenDto {
  @IsString()
  sessionToken: string;
}

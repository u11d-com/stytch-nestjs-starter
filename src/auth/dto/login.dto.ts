import { IntersectionType } from '@nestjs/swagger';
import { EmailDto, PasswordDto } from 'src/common/dto';

export class LoginDto extends IntersectionType(EmailDto, PasswordDto) {}

import { IntersectionType } from '@nestjs/swagger';
import { PasswordWithRequirementsDto, SessionTokenDto } from 'src/common/dto';

export class CreatePasswordDto extends IntersectionType(
  SessionTokenDto,
  PasswordWithRequirementsDto,
) {}

import { IntersectionType } from '@nestjs/swagger';
import {
  EmailDto,
  FirstNameDto,
  LastNameDto,
  PasswordWithRequirementsDto,
} from 'src/common/dto';

export class SignUpDto extends IntersectionType(
  EmailDto,
  FirstNameDto,
  LastNameDto,
  PasswordWithRequirementsDto,
) {}

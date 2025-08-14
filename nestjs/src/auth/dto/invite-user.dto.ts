import { IntersectionType } from '@nestjs/swagger';
import { EmailDto, FirstNameDto, LastNameDto } from 'src/common/dto';

export class InviteUserDto extends IntersectionType(
  EmailDto,
  FirstNameDto,
  LastNameDto,
) {}

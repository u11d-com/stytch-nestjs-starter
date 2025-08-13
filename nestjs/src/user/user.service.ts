import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StytchService } from '../stytch/stych.service';
import { CreateUserDto } from './dto';
import { User } from './entities';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly stytchService: StytchService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    const { user_id: stytchUserId } = await this.stytchService.create(dto);

    if (!stytchUserId) {
      throw new InternalServerErrorException('Failed to create Stytch user');
    }

    const user = this.userRepository.create({
      ...dto,
      stytchUserId,
    });

    return await this.userRepository.save(user);
  }
}

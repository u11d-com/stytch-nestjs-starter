import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './entities';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async fetchByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async fetchByStytchId(stytchUserId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { stytchUserId } });
  }

  async create(dto: DeepPartial<User>): Promise<User> {
    const user = this.userRepository.create(dto);

    return await this.userRepository.save(user);
  }
}

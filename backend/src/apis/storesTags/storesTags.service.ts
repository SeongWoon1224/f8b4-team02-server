import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { StoreTag } from './entities/storeTag.entity';

@Injectable()
export class StoreTagsService {
  constructor(
    @InjectRepository(StoreTag)
    private readonly storeTagRepository: Repository<StoreTag>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll({ email }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (user.role !== 'ADMIN') {
      throw new ConflictException('관리자가 아닙니다.');
    }
    return await this.storeTagRepository.find();
  }

  async create({ name, email }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (user.role !== 'ADMIN') {
      throw new ConflictException('관리자가 아닙니다.');
    }
    const tag = await this.storeTagRepository.save({
      name,
    });
    return tag;
  }

  async update({ before, after, email }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (user.role !== 'ADMIN') {
      throw new ConflictException('관리자가 아닙니다.');
    }
    const tag = await this.storeTagRepository.findOne({
      where: { name: before },
    });
    if (!tag) {
      throw new ConflictException('존재하지 않는 태그입니다.');
    }

    return await this.storeTagRepository.save({
      name: after,
    });
  }

  async delete({ name, email }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (user.role !== 'ADMIN') {
      throw new ConflictException('관리자가 아닙니다.');
    }
    const result = await this.storeTagRepository.delete({
      name,
    });
    return result.affected ? true : false;
  }
}

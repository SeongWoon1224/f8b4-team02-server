import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { StrLocationTag } from './entities/strLocationTag.entity';

@Injectable()
export class StrLocationsTagsService {
  constructor(
    @InjectRepository(StrLocationTag)
    private readonly StrLocationTagRepository: Repository<StrLocationTag>,
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
    return await this.StrLocationTagRepository.find();
  }

  async create({ name, email }) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (user.role !== 'ADMIN') {
      throw new ConflictException('관리자가 아닙니다.');
    }
    const tag = await this.StrLocationTagRepository.save({
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
    const tag = await this.StrLocationTagRepository.findOne({
      where: { name: before },
    });
    if (!tag) {
      throw new ConflictException('존재하지 않는 태그입니다.');
    }

    return await this.StrLocationTagRepository.save({
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
    const result = await this.StrLocationTagRepository.delete({
      name,
    });
    return result.affected ? true : false;
  }
}

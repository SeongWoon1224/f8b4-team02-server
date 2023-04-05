import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../reviewes/entities/review.entity';
import { User } from '../users/entities/user.entity';
import { ReviewResponse } from './entities/reviewResponse.entity';

@Injectable()
export class ReviewesResponsesService {
  constructor(
    @InjectRepository(ReviewResponse)
    private readonly reviewResponseRepository: Repository<ReviewResponse>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async find({ email }) {
    const user: any = await this.userRepository.findOne({
      where: { email },
    });
    const reviewRes = await this.reviewResponseRepository.find({
      where: { user: { userID: user.userID } },
      relations: ['user', 'review'],
    });
    return reviewRes;
  }

  async create({ email, contents, reviewID }) {
    const user: any = await this.userRepository.findOne({
      where: { email },
    });
    const beforeReview: any = await this.reviewResponseRepository.find({
      where: {
        user: { userID: user.userID },
        review: { reviewID },
      },
      relations: ['user', 'review'],
    });
    this.reviewRepository.save({
      ...beforeReview,
      contents,
    });
  }

  async update({ email, contents }) {
    const user: any = await this.userRepository.findOne({
      where: { email },
    });
    const reviewRes = await this.reviewResponseRepository.findOne({
      where: { user: { userID: user.userID } },
    });
    const result = await this.reviewResponseRepository.save({
      ...reviewRes,
      contents,
    });
    return result;
  }

  async delete({ email }) {
    const user: any = await this.userRepository.findOne({
      where: { email },
    });
    const result = await this.reviewResponseRepository.softDelete({
      user: { userID: user.userID },
    });
    return result.affected ? true : false;
  }
}

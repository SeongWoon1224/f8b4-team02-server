import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Review } from './entities/review.entity';
import { Store } from '../stores/entities/store.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ReviewResponse } from '../reviewesResponses/entities/reviewResponse.entity';
@Injectable()
export class ReviewesService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ReviewResponse)
    private readonly reviewResponseRepository: Repository<ReviewResponse>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async find({ email }) {
    const user: any = await this.userRepository.findOne({
      where: { email },
    });
    const reviewes = await this.reviewRepository.find({
      where: { user: { userID: user.userID } },
    });
    return reviewes;
  }

  async findStoreReview({ storeID, order }) {
    const store = await this.storeRepository.findOne({
      where: { storeID },
    });
    if (!store) {
      throw new ConflictException('해당 가게 정보가 없습니다.');
    }
    const reviews = await this.reviewRepository.find({
      where: { store: { storeID } },
      relations: ['user', 'store', 'reviewRes'],
      order: { createdAt: order },
    });
    return reviews;
  }

  async create({ createReviewInput, email, storeID }) {
    const { contents, rating } = createReviewInput;
    const user: any = await this.userRepository.findOne({
      where: { email },
    });

    const store: any = await this.storeRepository.findOne({
      where: { storeID },
      relations: ['locationTag', 'user', 'storeTag'],
    });
    if (!store) {
      throw new ConflictException('해당 가게 정보가 없습니다.');
    }

    const isRes = await this.checkReservation({ user, store });
    if (!isRes) {
      throw new ConflictException('예약 내역이 존재하지 않습니다.');
    }
    const avgRating = Math.round(((store.avgRating + rating) / 2) * 100) / 100;

    const newStore: any = await this.storeRepository.save({
      ...store,
      avgRating: avgRating,
    });

    const reviewRes: any = await this.reviewResponseRepository.save({
      contents: '',
      user: newStore.user.userID,
    });

    const review = await this.reviewRepository.save({
      contents,
      rating,
      user,
      store: newStore,
      reviewRes: reviewRes,
    });
    return review;
  }

  async update({ email, updateReviewInput, reviewID }) {
    const user: any = await this.userRepository.findOne({
      where: { email },
    });
    const review = await this.reviewRepository.findOne({
      where: {
        user: { userID: user.userID },
        reviewID,
      },
    });
    const result = await this.reviewRepository.save({
      ...review,
      ...updateReviewInput,
    });
    return result;
  }

  async delete({ email }) {
    const user: any = await this.userRepository.findOne({
      where: { email },
    });
    //어떤 리뷰인지 찾기
    const review = await this.reviewRepository.findOne({
      where: { user: { userID: user.userID } },
      relations: ['store', 'reviewRes'],
    });

    //리뷰 답글 지우기
    this.reviewResponseRepository.delete({
      reviewResID: review.reviewRes.reviewResID,
    });
    //리뷰지우기
    const result = await this.reviewRepository.softDelete({
      user: { userID: user.userID },
    });

    return result.affected ? true : false;
  }

  async checkReservation({ user, store }) {
    const reservation = await this.reservationRepository.findOne({
      where: {
        user: { userID: user.userID },
        store: { storeID: store.storeID },
      },
    });
    return reservation === null ? false : true;
  }

  async count({ storeID }) {
    const reviews = await this.reviewRepository.find({
      where: {
        store: { storeID },
      },
    });
    let count = 0;
    if (reviews) {
      count = reviews.length;
    }
    return count;
  }
}

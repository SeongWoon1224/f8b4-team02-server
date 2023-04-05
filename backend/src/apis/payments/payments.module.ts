import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamportService } from '../iamport/iamport.service';
import { User } from '../users/entities/user.entity';
import { Payment } from './entities/payment.entity';
import { PaymentResolver } from './payments.resolver';
import { PaymentService } from './payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      User, //
    ]),
  ],
  providers: [
    PaymentResolver, //
    PaymentService,
    IamportService,
  ],
})
export class PaymentModule {}

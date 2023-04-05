import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './apis/users/users.module';
import { StoresModule } from './apis/stores/stores.module';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { StoreTagsModule } from './apis/storesTags/storesTags.module';
import { StoresPicksModule } from './apis/storesPicks/storesPicks.module';
import { StrLocationsTagsModule } from './apis/strLocationsTags/strLocationsTags.module';
import { ReviewesModule } from './apis/reviewes/reviewes.module';
import { ReviewesResponsesModule } from './apis/reviewesResponses/reviewesResponses.module';
import { AuthModule } from './apis/auths/auths.module';
import { FilesModule } from './apis/files/files.module';
import { ReservationsModule } from './apis/reservations/reservations.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { PaymentModule } from './apis/payments/payments.module';
import { BoardsModule } from './apis/boards/boards.module';
import { IncomesModule } from './apis/incomes/incomes.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ReservationsModule,
    ReviewesModule,
    ReviewesResponsesModule,
    StoresModule,
    StoresPicksModule,
    StoreTagsModule,
    StrLocationsTagsModule,
    IncomesModule,
    UsersModule,
    AuthModule,
    FilesModule,
    PaymentModule,
    BoardsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          service: 'Gmail',
          host: process.env.DATABASE_HOST,
          port: Number(process.env.DATABASE_PORT),
          secure: false, // upgrade later with STARTTLS
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          template: {
            dir: process.cwd() + '/templates/',
            adapter: new HandlebarsAdapter(), // or new PugAdapter()
            options: {
              strict: true,
            },
          },
        },
      }),
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      debug: false,
      autoSchemaFile: 'src/commons/graphql/schema.gql',
      context: ({ req, res }) => ({ req, res }),
      cors: {
        credential: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: [
          'Access-Control-Allow-Headers',
          'Authorization',
          'X-Requested-With',
          'Content-Type',
          'Accept',
        ],
        exposedHeaders: ['Authorization', 'Set-Cookie', 'Cookie'],
        origin: ['http://localhost:3000', 'https://meongtopia.site'],
      },
    }),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [__dirname + '/apis/**/*.entity.*'], // ** 폴더 안에서 뒤에 내용 찾기, ts에서 js로 바뀌기에 마지막에 *
      synchronize: true,
      logging: true, //ORM으로 부터 어떻게 mySQL에 명령어가 변경되어서 들어가는지
    }),
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: 'redis://my-redis:6379',
      isGlobal: true,
    }),
  ],
})
export class AppModule {}

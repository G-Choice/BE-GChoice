import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import { EmailService } from '../email/email.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: "tammaxdog@gmail.com",
          pass:"ivnw kvyg fjhw lrfm",
        },
      },
      defaults: {
        from: 'tammaxdog@gmail.com',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
})
export class AuthModule {}

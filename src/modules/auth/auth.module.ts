import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import { EmailService } from '../email/email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User]),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'tammaxdog@gmail.com',
          pass: 'ivnw kvyg fjhw lrfm',
        },
      },
      defaults: {
        from: 'tammaxdog@gmail.com',
      },
    }),
    JwtModule.register({
      secret: '123456789s',
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, JwtStrategy],
})
export class AuthModule {}
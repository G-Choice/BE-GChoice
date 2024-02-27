import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import { EmailService } from '../email/email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
// import { JwtStrategy } from './jwt.strategy';

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
      global:true,
      secret:'123456',
      signOptions:{expiresIn:14400}
    }),
    ConfigModule
  ],

  controllers: [AuthController],
  providers: [AuthService, EmailService],
})
export class AuthModule {}
import { Module } from '@nestjs/common';
import { DbModule } from './common/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

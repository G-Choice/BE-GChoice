import { Module, OnModuleInit } from '@nestjs/common';
import { DbModule } from './common/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { ProductModule } from './modules/product/product.module';
import { ProductDiscountModule } from './modules/product-discount/product-discount.module';
import { GruopsModule } from './modules/gruops/groups.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ScheduleModule } from '@nestjs/schedule';




@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DbModule,
    AuthModule,
    UserModule,
    CloudinaryModule,
    ProductModule,
    ProductDiscountModule,
    GruopsModule,
    FirebaseModule

  ],
  controllers: [],
  providers: [],
})
export class AppModule  {

}
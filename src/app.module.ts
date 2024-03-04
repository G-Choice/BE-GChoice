import { Module } from '@nestjs/common';
import { DbModule } from './common/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { ProductModule } from './modules/product/product.module';
import { AppController } from './app.controller';
import { ProductDiscountModule } from './modules/product-discount/product-discount.module';
import { GruopsModule } from './modules/gruops/groups.module';




@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    AuthModule,
    UserModule,
    CloudinaryModule,
    ProductModule,
    ProductDiscountModule,
    GruopsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }

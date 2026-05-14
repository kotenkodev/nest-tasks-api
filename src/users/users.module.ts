import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypedConfigService } from 'src/config/typed-config.service';
import { PasswordService } from './password/password.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: TypedConfigService) => {
        const auth = config.get('auth');
        return {
          secret: auth?.jwt.secret,
          signOptions: {
            expiresIn: auth?.jwt.expiresIn as any,
          },
        };
      },
    }),
  ],
  providers: [PasswordService],
})
export class UsersModule {}

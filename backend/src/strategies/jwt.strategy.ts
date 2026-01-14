// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';
// import { PrismaService } from '@/prisma/prisma.service';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     config: ConfigService,
//     private prisma: PrismaService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: config.get('JWT_SECRET') || 'asdasdhsadasjdjajd',
//     });
//   }

//   async validate(payload: { sub: string; email: string; role: string }) {
//     if (payload.role === 'ADMIN') {
//       return {
//         id: payload.sub,
//         email: payload.email,
//         role: payload.role,
//       };
//     }
//     const member = await this.prisma.member.findUnique({
//       where: { id: payload.sub },
//     });

//     if (!member) {
//       throw new UnauthorizedException();
//     }

//     return {
//       id: member.id,
//       email: member.email,
//       role: 'MEMBER',
//     };
//   }
// }

import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { PayloadDto } from '@/@types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'dsjdfhjsdhfjhsdjfjkh',
    });
  }

  async validate(payload: any): Promise<PayloadDto> {
    try {
      const member = await this.prisma.member.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          membershipId: true,
          avatar: true,
        },
      });

      if (!member) {
        throw new UnauthorizedException('User not found');
      }

      if (member.status !== 'Active') {
        throw new UnauthorizedException('Account is not active');
      }

      return {
        id: member.id,
        email: member.email,
        role: member.role,
        firstName: member.firstName,
        lastName: member.lastName,
        membershipId: member.membershipId,
        avatar: member.avatar ?? '',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }
}

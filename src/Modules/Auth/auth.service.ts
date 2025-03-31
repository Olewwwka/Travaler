import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../Users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const fullUser = await this.usersService.findOneByEmailWithPermissions(user.email);

    if(!fullUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(user.password, fullUser.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userForResponse = {
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      roles: fullUser.roles
    };

    const payload = { email: fullUser?.email, sub: fullUser?.id, roles: fullUser?.roles};
    return {
      user: userForResponse,
      access_token: this.jwtService.sign(payload),
    };
  }
}
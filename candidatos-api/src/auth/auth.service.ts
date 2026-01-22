import { Injectable } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    // private readonly jwtService: JwtService,
  ) {}

  /*async validateToken(token: string): Promise< any> {

    try {

      // Verifica y decodifica el token JWT
      const decoded = this.jwtService.verify(token);

      console.log("Contnido",decoded);

      return decoded; // Esto debe coincidir con tu estructura UserInfo

    } catch (e) {
      return e; // Si el token es inválido o ha expirado
    }

  }
    */

}

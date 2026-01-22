// src/app/core/enums/role.enum.ts
export enum Role {
  /*SuperAdmin = 1,
  Admin = 2,
  Moderator = 4,
  User = 8,
  Guest = 16*/

    Admin = 1,
    Rrhh = 2,
    Usuario = 3
}

// Helper functions para roles
export class RoleHelper {
  static hasRole(userRoles: number, requiredRole: Role): boolean {
    return (userRoles & requiredRole) === requiredRole;
  }

  static hasAnyRole(userRoles: number, requiredRoles: Role[]): boolean {
    return requiredRoles.some(role => this.hasRole(userRoles, role));
  }

  static hasAllRoles(userRoles: number, requiredRoles: Role[]): boolean {
    return requiredRoles.every(role => this.hasRole(userRoles, role));
  }

  static addRole(userRoles: number, role: Role): number {
    return userRoles | role;
  }

  static removeRole(userRoles: number, role: Role): number {
    return userRoles & ~role;
  }

  static getRoleNames(userRoles: number): string[] {
    const roles: string[] = [];
    Object.keys(Role).forEach(key => {
      if (this.hasRole(userRoles, Role[key as keyof typeof Role])) {
        roles.push(key);
      }
    });
    return roles;
  }
}
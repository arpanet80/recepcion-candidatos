import { applyDecorators, UseGuards } from "@nestjs/common";
import { Role } from "../enums/rol.enum";
import { Roles } from "./roles.decorator";
import { ReolesGuard } from "../guards/reoles.guard";
import { AuthGuard } from "../guards/auth.guard";

export function Auth(...roles: Role[]) {
    return applyDecorators(
        Roles(...roles),
        UseGuards(AuthGuard, ReolesGuard)
    );
  }
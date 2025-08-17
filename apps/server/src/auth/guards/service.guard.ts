import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";

import { Config } from "@/server/config/schema";

@Injectable()
export class ServiceGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Config>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const serviceToken = request.headers["x-service-token"] as string;

    if (!serviceToken) {
      throw new UnauthorizedException("Service token is required");
    }

    try {
      const payload = this.jwtService.verify(serviceToken, {
        secret: this.configService.get("SERVICE_JWT_SECRET"),
      });

      // Validate service provider is allowed
      const allowedProviders =
        this.configService.get("ALLOWED_SERVICE_PROVIDERS")?.split(",") || [];
      if (allowedProviders.length > 0 && !allowedProviders.includes(payload.serviceProvider)) {
        throw new UnauthorizedException("Service provider not allowed");
      }

      // Attach service info to request
      request.service = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid service token");
    }
  }
}

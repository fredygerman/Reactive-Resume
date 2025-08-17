import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AuthModule } from "../auth/auth.module";
import { ResumeModule } from "../resume/resume.module";
import { UserModule } from "../user/user.module";

import { ServiceController } from "./service.controller";

@Module({
  imports: [JwtModule, AuthModule.register(), UserModule, ResumeModule],
  controllers: [ServiceController],
})
export class ServiceModule {}

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
  Headers,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateResumeDto, UpdateResumeDto, ResumeDto } from "@reactive-resume/dto";

import { ServiceGuard } from "../auth/guards/service.guard";
import { AuthService } from "../auth/auth.service";
import { ResumeService } from "../resume/resume.service";
import { payloadSchema } from "../auth/utils/payload";

@ApiTags("Service")
@Controller("service")
@UseGuards(ServiceGuard)
export class ServiceController {
  constructor(
    private readonly authService: AuthService,
    private readonly resumeService: ResumeService,
  ) {}

  @Post("authenticate")
  async authenticateService(
    @Headers("x-service-token") serviceToken: string,
    @Body() { externalUserId }: { externalUserId: string },
  ) {
    if (!serviceToken) {
      throw new UnauthorizedException("Service token is required");
    }

    // Extract service provider from token (this will be validated by the ServiceGuard)
    const tokenPayload = JSON.parse(Buffer.from(serviceToken.split(".")[1], "base64").toString());
    const serviceProvider = tokenPayload.serviceProvider;

    // Get or create service user
    const user = await this.authService.getOrCreateServiceUser(externalUserId, serviceProvider);

    // Generate access token for the service user
    const authPayload = payloadSchema.parse({ id: user.id, isTwoFactorAuth: false });
    const accessToken = this.authService.generateToken("access", authPayload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    };
  }

  @Get("user/:externalUserId/resumes")
  async getUserResumes(
    @Param("externalUserId") externalUserId: string,
    @Headers("x-service-token") serviceToken: string,
  ) {
    // Extract service provider from token
    const tokenPayload = JSON.parse(Buffer.from(serviceToken.split(".")[1], "base64").toString());
    const serviceProvider = tokenPayload.serviceProvider;

    const user = await this.authService.getOrCreateServiceUser(externalUserId, serviceProvider);
    return this.resumeService.findAll(user.id);
  }

  @Post("user/:externalUserId/resume")
  async createResumeForUser(
    @Param("externalUserId") externalUserId: string,
    @Body() createResumeDto: CreateResumeDto,
    @Headers("x-service-token") serviceToken: string,
  ) {
    // Extract service provider from token
    const tokenPayload = JSON.parse(Buffer.from(serviceToken.split(".")[1], "base64").toString());
    const serviceProvider = tokenPayload.serviceProvider;

    const user = await this.authService.getOrCreateServiceUser(externalUserId, serviceProvider);
    return this.resumeService.create(user.id, createResumeDto);
  }

  @Patch("user/:externalUserId/resume/:resumeId")
  async updateResumeForUser(
    @Param("externalUserId") externalUserId: string,
    @Param("resumeId") resumeId: string,
    @Body() updateResumeDto: UpdateResumeDto,
    @Headers("x-service-token") serviceToken: string,
  ) {
    // Extract service provider from token
    const payload = JSON.parse(Buffer.from(serviceToken.split(".")[1], "base64").toString());
    const serviceProvider = payload.serviceProvider;

    const user = await this.authService.getOrCreateServiceUser(externalUserId, serviceProvider);
    return this.resumeService.update(user.id, resumeId, updateResumeDto);
  }

  @Delete("user/:externalUserId/resume/:resumeId")
  async deleteResumeForUser(
    @Param("externalUserId") externalUserId: string,
    @Param("resumeId") resumeId: string,
    @Headers("x-service-token") serviceToken: string,
  ) {
    // Extract service provider from token
    const payload = JSON.parse(Buffer.from(serviceToken.split(".")[1], "base64").toString());
    const serviceProvider = payload.serviceProvider;

    const user = await this.authService.getOrCreateServiceUser(externalUserId, serviceProvider);
    return this.resumeService.remove(user.id, resumeId);
  }

  @Get("resume/:resumeId/pdf")
  async generateResumePDF(
    @Param("resumeId") resumeId: string,
    @Headers("x-user-id") userId?: string,
  ): Promise<{ url: string }> {
    // Find the resume (service guard ensures we have access)
    const resume = await this.resumeService.findOne(resumeId, userId);
    const pdfUrl = await this.resumeService.generatePdfUrl(resumeId, userId || resume.userId);

    if (!pdfUrl) {
      throw new Error("Failed to generate PDF URL");
    }

    return { url: pdfUrl };
  }

  @Get("resume/:resumeId/preview")
  async generateResumePreview(
    @Param("resumeId") resumeId: string,
    @Headers("x-user-id") userId?: string,
  ): Promise<{ url: string }> {
    // Find the resume (service guard ensures we have access)
    const resume = await this.resumeService.findOne(resumeId, userId);
    const previewUrl = await this.resumeService.generatePreviewUrl(
      resumeId,
      userId || resume.userId,
    );

    if (!previewUrl) {
      throw new Error("Failed to generate preview URL");
    }

    return { url: previewUrl };
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PurchasesService } from './purchases.service';
import type { Request, Response } from 'express';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.purchasesService.create(body, req.user);
  }

  @Post('webhook')
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: any,
  ) {
    return this.purchasesService.handleStripeWebhook(signature, req.rawBody);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMyPurchases(@Req() req: any) {
    return this.purchasesService.findMyPurchases(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/download')
  download(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    return this.purchasesService.download(id, req.user, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sales')
  findMySales(@Req() req: any) {
    return this.purchasesService.findMySales(req.user);
  }
}
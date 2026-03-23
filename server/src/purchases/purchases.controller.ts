import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.purchasesService.create(body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMyPurchases(@Req() req: any) {
    return this.purchasesService.findMyPurchases(req.user);
  }
}
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AssetsService } from './assets.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer'; 
import { ArtistOnlyGuard } from '../auth/roles.guard';
import type { Response } from 'express';


@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @UseGuards(JwtAuthGuard, ArtistOnlyGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'preview', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
      },
    ),
  )
  create(
    @UploadedFiles()
    files: {
      audio?: Express.Multer.File[];
      preview?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    },
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.assetsService.create(body, req.user, files);
  }

  @Get()
  findAll() {
    return this.assetsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-uploads')
  findMyUploads(@Req() req: any) {
    return this.assetsService.findMyUploads(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Get(':id/preview')
  preview(@Param('id') id: string, @Res() res: Response) {
    return this.assetsService.preview(id, res);
  }

  @UseGuards(JwtAuthGuard, ArtistOnlyGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.assetsService.remove(id, req.user);
  }

  @UseGuards(JwtAuthGuard, ArtistOnlyGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.assetsService.update(id, body, req.user);
  }
}

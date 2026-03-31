import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ArtistOnlyGuard } from '../auth/roles.guard';
import type { Response } from 'express';

function generateFileName(originalName: string) {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${uniqueSuffix}${extname(originalName)}`;
}

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
        storage: diskStorage({
          destination: (req, file, cb) => {
            if (file.fieldname === 'audio') {
              cb(null, './uploads/audio');
            } else if (file.fieldname === 'preview') {
              cb(null, './uploads/previews');
            } else if (file.fieldname === 'cover') {
              cb(null, './uploads/covers');
            } else {
              cb(null, './uploads');
            }
          },
          filename: (req, file, cb) => {
            cb(null, generateFileName(file.originalname));
          },
        }),
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
}
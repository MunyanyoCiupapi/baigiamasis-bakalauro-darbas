import { Controller, Get, Post, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { SongsService } from './songs.service';
import { Song } from './songs.interfaces';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  findAll(): Song[] {
    return this.songsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Song {
    const song = this.songsService.findOne(Number(id));
    if (!song) throw new NotFoundException(`Song #${id} not found`);
    return song;
  }

  @Post()
  create(@Body() body: Omit<Song, 'id'>): Song {
    return this.songsService.create(body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): { deleted: boolean } {
    const deleted = this.songsService.remove(Number(id));
    if (!deleted) throw new NotFoundException(`Song #${id} not found`);
    return { deleted: true };
  }
}

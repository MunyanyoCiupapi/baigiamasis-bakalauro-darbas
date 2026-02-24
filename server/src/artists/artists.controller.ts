import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { Artist } from './artists.interfaces';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  findAll(): Artist[] {
    return this.artistsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Artist {
    const artist = this.artistsService.findOne(Number(id));
    if (!artist) throw new NotFoundException(`Artist #${id} not found`);
    return artist;
  }
}

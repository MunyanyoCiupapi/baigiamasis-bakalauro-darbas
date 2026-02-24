import { Injectable } from '@nestjs/common';
import { Song } from './songs.interfaces';

@Injectable()
export class SongsService {
  private songs: Song[] = [
    { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200, genre: 'Synth-pop', coverUrl: 'https://picsum.photos/seed/song1/300/300' },
    { id: 2, title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: 203, genre: 'Pop', coverUrl: 'https://picsum.photos/seed/song2/300/300' },
    { id: 3, title: 'Stay', artist: 'The Kid LAROI', album: 'F*CK LOVE 3', duration: 141, genre: 'Pop', coverUrl: 'https://picsum.photos/seed/song3/300/300' },
    { id: 4, title: 'Peaches', artist: 'Justin Bieber', album: 'Justice', duration: 198, genre: 'R&B', coverUrl: 'https://picsum.photos/seed/song4/300/300' },
    { id: 5, title: 'Good 4 U', artist: 'Olivia Rodrigo', album: 'SOUR', duration: 178, genre: 'Pop-punk', coverUrl: 'https://picsum.photos/seed/song5/300/300' },
    { id: 6, title: 'Industry Baby', artist: 'Lil Nas X', album: 'Montero', duration: 212, genre: 'Hip-hop', coverUrl: 'https://picsum.photos/seed/song6/300/300' },
    { id: 7, title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', duration: 238, genre: 'Indie pop', coverUrl: 'https://picsum.photos/seed/song7/300/300' },
    { id: 8, title: 'Montero', artist: 'Lil Nas X', album: 'Montero', duration: 137, genre: 'Pop rap', coverUrl: 'https://picsum.photos/seed/song8/300/300' },
  ];

  findAll(): Song[] {
    return this.songs;
  }

  findOne(id: number): Song | undefined {
    return this.songs.find((s) => s.id === id);
  }

  create(song: Omit<Song, 'id'>): Song {
    const maxId = this.songs.reduce((max, s) => Math.max(max, s.id), 0);
    const newSong = { ...song, id: maxId + 1 };
    this.songs.push(newSong);
    return newSong;
  }

  remove(id: number): boolean {
    const index = this.songs.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.songs.splice(index, 1);
    return true;
  }
}

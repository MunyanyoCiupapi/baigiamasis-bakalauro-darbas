import { Injectable } from '@nestjs/common';
import { Artist } from './artists.interfaces';

@Injectable()
export class ArtistsService {
  private artists: Artist[] = [
    { id: 1, name: 'The Weeknd', genre: 'R&B / Synth-pop', bio: 'Abel Makkonen Tesfaye, known professionally as The Weeknd, is a Canadian singer, songwriter, and record producer.', imageUrl: 'https://picsum.photos/seed/artist1/300/300' },
    { id: 2, name: 'Dua Lipa', genre: 'Pop', bio: 'Dua Lipa is a British-Albanian singer and songwriter. She rose to fame with her debut single "New Rules".', imageUrl: 'https://picsum.photos/seed/artist2/300/300' },
    { id: 3, name: 'Olivia Rodrigo', genre: 'Pop / Pop-punk', bio: 'Olivia Isabel Rodrigo is an American singer-songwriter and actress known for her debut single "drivers license".', imageUrl: 'https://picsum.photos/seed/artist3/300/300' },
    { id: 4, name: 'Lil Nas X', genre: 'Hip-hop / Pop rap', bio: 'Montero Lamar Hill, known professionally as Lil Nas X, is an American rapper and singer.', imageUrl: 'https://picsum.photos/seed/artist4/300/300' },
    { id: 5, name: 'Glass Animals', genre: 'Indie pop / Psychedelic pop', bio: 'Glass Animals is a British indie pop band formed in Oxford, known for their unique sound and visuals.', imageUrl: 'https://picsum.photos/seed/artist5/300/300' },
  ];

  findAll(): Artist[] {
    return this.artists;
  }

  findOne(id: number): Artist | undefined {
    return this.artists.find((a) => a.id === id);
  }
}

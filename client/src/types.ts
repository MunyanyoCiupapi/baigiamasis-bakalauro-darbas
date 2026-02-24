export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  genre: string;
  coverUrl: string;
}

export interface Artist {
  id: number;
  name: string;
  genre: string;
  bio: string;
  imageUrl: string;
}

export interface Song {
  id: number;
  spotify_id?: string;
  title: string;
  artist?: string;
  album?: string;
  duration_ms?: number;
  image_url?: string;
  raw_json?: any;
  created_at?: string;
  updated_at?: string;
}

export interface SpotifyTrack {
  spotify_id: string;
  title: string;
  artist: string;
  album: string;
  duration_ms: number;
  image_url?: string;
}

export interface SongState {
  songs: Song[];
  searchResults: SpotifyTrack[];
  loading: boolean;
  error: string | null;
}
export interface Point {
    id?: string;
    latitude: number;
    longitude: number;
    name: string;
    description: string;
    imageUrl?: BinaryType;
    isUserLocation?: boolean;
  }

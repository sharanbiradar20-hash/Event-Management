export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  image_url: string | null;
  organizer_id: string;
  created_at?: string;
}

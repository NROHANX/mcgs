export interface Provider {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  contact: string;
  available: boolean;
  services: Service[];
  reviews: Review[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  estimatedTime?: string;
}

export interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isProvider: boolean;
}
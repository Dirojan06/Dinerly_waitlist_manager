export type GuestPortalTab =
  | 'HOME'
  | 'WAITLIST'
  | 'MENU'
  | 'OFFERS'
  | 'REWARDS'| 'PROFILE';

export interface GuestAccount {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  token?: string;
}

export interface PortalRestaurant {
  id: number;
  name: string;
  cuisine: string;
  distance: string;
  rating: number;
  reviewCount: number;
  waitTime: number;
  partiesAhead: number;
  tableStatus: string;
  imageClass: string;
  status: 'OPEN' | 'BUSY' | 'NO_WAIT' | 'FULL';
}

export interface PortalOffer {
  id: number;
  restaurantName: string;
  title: string;
  description: string;
  discountText: string;
  validUntil: string;
  imageClass: string;
}

export interface PortalReward {
  id: number;
  title: string;
  description: string;
  pointsRequired: number;
  available: boolean;
  icon: string;
}
export interface GetGuestHistory {
  id: number;
  guestName: string;
  guestPhone: string;
  partySize: number;
  preference: string;
  notes: string;
  status: string;
  joinedAt: string | null;
  approvedAt: string | null;
  notifiedAt: string | null;
  seatedAt: string | null;
  tableName?: string | null;
}

export interface GuestHistoryPage {
  content: GetGuestHistory[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface GuestHistoryResponse {
  success: boolean;
  message: string;
  data: GuestHistoryPage;
}
export interface JoinWaitlistRequest {
  restaurantId: number;
  name: string;
  phone: string;
  partySize: number;
  preference: string;
  notes: string;
}

export interface addGuestToWaitlistRequest{
  name: string,
  phone: number,
  partySize: number,
  preference: string,
  notes: string,
  position: number,
  estimatedWaitTime: number
}

export interface PendingGuest {
  id: number,
  guestName: string,
  guestPhone: string,
  partySize: number,
  preference: string,
  notes: string,
  status: string
}

export interface PendingGuestResponse {
  success: boolean;
  message: string;
  data: PendingGuest[];
}

export interface getGuestWaitingStatus{
  restaurantId: string,
  phone: string
}

export interface WaitingGuest {
  id: number;
  guestName: string;
  guestPhone: string;
  partySize: number;
  preference: string;
  notes: string;
  status: string;
  position: number;
  estimatedWaitTime: number;
}

export interface WaitingGuestResponse {
  success: boolean;
  message: string;
  data: WaitingGuest[];
}

export interface NotifiedGuest {
  id: number;
  guestName: string;
  guestPhone: string;
  partySize: number;
  preference: string;
  notes: string;
  status: string;
  position: number;
  estimatedWaitTime: number;
}

export interface NotifiedGuestResponse {
  success: boolean;
  message: string;
  data: NotifiedGuest[];
}

export interface SeatedGuest {
  id: number;
  guestName: string;
  guestPhone: string;
  partySize: number;
  preference: string;
  notes: string;
  status: string;
}

export interface SeatedGuestResponse {
  success: boolean;
  message: string;
  data: SeatedGuest[];
}

export interface DashboardStatus {
  id: number;
  guestName: string;
  guestPhone: string;
  partySize: number;
  preference: string;
  notes: string;
  status: string;
  position?: number;
  estimatedWaitTime?: number;
}

export interface DashboardWaitlistResponse {
  success: boolean;
  message: string;
  data: DashboardStatus[];
}

export interface ApproveWaitlistRequest {
  estimatedWaitTime: number;
}

export interface notifiyguestcallRequest{
  estimatedWaitTime: number,
  position: number
}

export interface seatedGuestcallRequest{
  tableName: string
}

export interface tableList {
  id: number,
  tableNumber: string,
  capacity: number,
  status: string
}

export interface TablelistResponse {
  success: boolean;
  message: string;
  data: tableList[];
}

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
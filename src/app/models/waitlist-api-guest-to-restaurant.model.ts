export interface JoinWaitlistRequest {
  restaurantId: number;
  name: string;
  phone: string;
  partySize: number;
  preference: string;
  notes: string;
}

export interface addGuestToWaitlistRequest {
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
  status: string;
  joinedAt: string;
}

export interface CancelledGuest {
  id: number,
  guestName: string,
  guestPhone: string,
  partySize: number,
  preference: string,
  notes: string,
  status: string;
  joinedAt: string;
}

export interface PendingGuestResponse {
  success: boolean;
  message: string;
  data: PendingGuest[];
}

export interface CancelledGuestResponse {
  success: boolean;
  message: string;
  data: CancelledGuest[];
}


export interface getGuestWaitingStatus {
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
  joinedAt: string;
  approvedAt: string;
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
  joinedAt: string;
  approvedAt: string;
  notifiedAt: string
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
  seatedAt: string;
}

export interface SeatedGuestResponse {
  success: boolean;
  message: string;
  data: SeatedGuest[];
}

export interface getDashboardData {
  averageWaitTime: number,
  noShowsToday: number,
  occupiedTables: number,
  openTables: number,
  reservedTables: number,
  seatedToday: number,
  tablesNeedingCleaning: number,
  totalNotified: number,
  totalWaiting: number
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: getDashboardData;
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

export interface notifiyguestcallRequest {
  estimatedWaitTime: number,
  position: number
}

export interface seatedGuestcallRequest {
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

export interface guestReportsPage {
  averageWaitTime: number,
  todayGuestsCount: number,
  todaySeatedCount: number,
  totalCancelled: number,
  totalGuests: number,
  totalNotified: number,
  totalSeated: number,
  totalWaiting: number
}
export interface guestReportsResponse {
  success: boolean;
  message: string;
  data: guestReportsPage;
}

export interface addTabletoRestaurantRequest {
  tableNumber: string,
  capacity: number
}
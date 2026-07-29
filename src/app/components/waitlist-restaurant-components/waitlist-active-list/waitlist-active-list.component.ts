import {
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';

import {
  CancelledGuest,
  DashboardStatus,
  getDashboardData,
  NotifiedGuest,
  PendingGuest,
  SeatedGuest,
  tableList,
  WaitingGuest
} from 'src/app/models/waitlist-api-guest-to-restaurant.model';

import { NotificationService } from 'src/app/services/notification.service';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';
import { WaitlistRestaurantModalService } from 'src/app/services/waitlist-restaurant-modal.service';

interface DashboardLiveGuest {
  id: number;
  guestName: string;
  guestPhone: string;
  partySize: number;

  preference?: string;
  notes?: string;
  status: string;
  position?: number;
  estimatedWaitTime?: number;

  joinedAt?: string;
  approvedAt?: string;
  notifiedAt?: string;
  seatedAt?: string;
  cancelledAt?: string;

  smsStatus?: string;
  smsMessage?: string;
  smsError?: string;

  latestCustomerReply?: string;
  customerReplyDescription?: string;
  customerReplyReceivedAt?: string;
  customerReplySid?: string;

  latestVoiceReply?: string;
  callStatus?: string;
  callResponse?: string;
  voiceReplyReceivedAt?: string;
  voiceReplyDigits?: string;

  tableName?: string;
}

type WaitlistTab =
  | 'WAITING'
  | 'NOTIFIED'
  | 'SEATED'
  | 'CANCELLED';

type CustomerReplyType =
  | '1'
  | '2'
  | '3'
  | '';

@Component({
  selector: 'app-waitlist-active-list',
  templateUrl: './waitlist-active-list.component.html',
  styleUrls: ['./waitlist-active-list.component.css']
})
export class WaitlistActiveListComponent
  implements OnInit, OnDestroy {

  restaurantId = 1;

  dashboardStatus: DashboardStatus[] = [];

  dashboardData: getDashboardData = {
    averageWaitTime: 0,
    noShowsToday: 0,
    occupiedTables: 0,
    openTables: 0,
    reservedTables: 0,
    seatedToday: 0,
    tablesNeedingCleaning: 0,
    totalNotified: 0,
    totalWaiting: 0
  };

  pendingGuests: PendingGuest[] = [];
  waitingGuests: WaitingGuest[] = [];
  notifiedGuests: NotifiedGuest[] = [];
  seatedGuests: SeatedGuest[] = [];
  cancelledGuests: CancelledGuest[] = [];

  activeTab: WaitlistTab = 'WAITING';

  showPendingBox = false;
  showGuestPopup = false;
  showRejectReason = false;

  selectedGuest: any = null;
  selectedWaitTime = 5;
  waitTimeOptions = [
    5,
    10,
    15,
    20,
    25,
    30
  ];

  rejectReason = '';

  isLoading = false;
  isApproving = false;
  isRejecting = false;
  isNotifying = false;
  isSeating = false;

  tables: tableList[] = [];
  openTables: tableList[] = [];
  selectedTable: tableList | null = null;

  showTable = false;

  tableStats = {
    total: 0,
    open: 0,
    occupied: 0,
    reserved: 0,
    cleaning: 0
  };

  donutStyle = '';

  currentDateTime = '';

  private clockInterval: ReturnType<
    typeof setInterval
  > | null = null;

  private refreshInterval: ReturnType<
    typeof setInterval
  > | null = null;

  private sub = new Subscription();

  recentChangedGuestId: number | null = null;

  showLeaveConfirm = false;
  isSending = false;
  isLeaving = false;

  shownotificationPopup = false;
  specificMessage = '';
  messageFormSubmitted = false;

  selectedContactGuestId:
    number | string | null = null;

  showCallingPopup = false;
  callingGuest: any = null;
  isSendingSms = false;

  /*
   * Customer reply detection.
   */

  private previousCustomerReplies =
    new Map<number, string>();

  shakingGuestIds = new Set<number>();

  private customerReplyInitialLoadCompleted =
    false;

  private replyShakeTimeouts =
    new Map<
      number,
      ReturnType<typeof setTimeout>
    >();

  /*
   * Seated guest edit functionality.
   */

  showEditSeatedGuestModal = false;

  selectedSeatedGuest:
    DashboardLiveGuest | null = null;

  additionalGuestCount = 0;

  editSeatedAction:
    'RESEAT' | 'WAITING' = 'RESEAT';

  selectedEditTable: any = null;

  editWaitingMinutes: number | null = null;

  isUpdatingSeatedGuest = false;

  constructor(
    private router: Router,
    public modalService:
      WaitlistRestaurantModalService,
    private waitlistApi:
      WaitlistApiRestaurantService,
    private notificationService:
      NotificationService
  ) { }

  ngOnInit(): void {
    this.loadDashboardAllData();

    this.updateDateTime();

    this.clockInterval = setInterval(() => {
      this.updateDateTime();
    }, 1000);

    this.refreshInterval = setInterval(() => {
      this.loadDashboardAllData(false);
    }, 5000);
  }

  loadDashboardAllData(
    showLoader: boolean = true
  ): void {

    if (showLoader) {
      this.isLoading = true;
    }

    forkJoin({
      dashboard:
        this.waitlistApi.getDashboardData(
          this.restaurantId
        ),

      pending:
        this.waitlistApi.getGuestsStatus(
          this.restaurantId,
          'PENDING',
          ''
        ),

      waiting:
        this.waitlistApi.getWaitingGuests(
          this.restaurantId,
          'WAITING',
          ''
        ),

      notified:
        this.waitlistApi.getNotifiedGuests(
          this.restaurantId,
          'NOTIFIED',
          ''
        ),

      seated:
        this.waitlistApi.getSeatedGuests(
          this.restaurantId,
          'SEATED',
          ''
        ),

      cancelled:
        this.waitlistApi.getCancelledGuests(
          this.restaurantId,
          'CANCELLED',
          ''
        ),

      tables:
        this.waitlistApi
          .getRestaurantTableslist(
            this.restaurantId
          )
    }).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.dashboard.success) {
          this.dashboardData =
            res.dashboard.data;
        }

        this.pendingGuests =
          res.pending.data || [];

        this.waitingGuests =
          res.waiting.data || [];

        this.notifiedGuests =
          res.notified.data || [];

        this.seatedGuests =
          res.seated.data || [];

        this.cancelledGuests =
          res.cancelled.data || [];

        this.tables =
          res.tables.data || [];

        this.openTables =
          this.tables.filter(
            table =>
              table.status === 'OPEN'
          );

        this.calculateTableStats();

        /*
         * Detect only real customer replies.
         */
        this.detectNewCustomerReplies(
          this.allDashboardGuests
        );
      },

      error: () => {
        this.isLoading = false;

        alert(
          'Unable to load dashboard data'
        );
      }
    });
  }

  get allDashboardGuests():
    DashboardLiveGuest[] {

    return [
      ...this.waitingGuests,
      ...this.notifiedGuests,
      ...this.seatedGuests,
      ...this.cancelledGuests
    ].map((guest: any) =>
      this.mapDashboardGuest(guest)
    );
  }

  get liveWaitlistGuests():
    DashboardLiveGuest[] {

    return [
      ...this.waitingGuests,
      ...this.notifiedGuests
    ].map((guest: any) =>
      this.mapDashboardGuest(guest)
    );
  }

  private mapDashboardGuest(
    guest: any
  ): DashboardLiveGuest {

    return {
      id: guest.id,
      guestName: guest.guestName,
      guestPhone: guest.guestPhone,
      partySize: guest.partySize,

      preference: guest.preference,
      notes: guest.notes,
      status: guest.status,
      position: guest.position,

      estimatedWaitTime:
        guest.estimatedWaitTime,

      joinedAt: guest.joinedAt,
      approvedAt: guest.approvedAt,
      notifiedAt: guest.notifiedAt,
      seatedAt: guest.seatedAt,
      cancelledAt: guest.cancelledAt,

      smsStatus: guest.smsStatus,
      smsMessage: guest.smsMessage,
      smsError: guest.smsError,

      latestCustomerReply:
        guest.latestCustomerReply,

      customerReplyDescription:
        guest.customerReplyDescription,

      customerReplyReceivedAt:
        guest.customerReplyReceivedAt,

      customerReplySid:
        guest.customerReplySid,

      latestVoiceReply:
        guest.latestVoiceReply,

      callStatus: guest.callStatus,
      callResponse: guest.callResponse,

      voiceReplyReceivedAt:
        guest.voiceReplyReceivedAt,

      voiceReplyDigits:
        guest.voiceReplyDigits,

      tableName: guest.tableName
    };
  }

  updateDateTime(): void {
    this.currentDateTime =
      new Date().toLocaleString(
        'en-IN',
        {
          timeZone: 'America/Toronto',
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }
      );
  }

  togglePendingBox(): void {
    this.showPendingBox =
      !this.showPendingBox;
  }

  openPendingGuest(
    guest: PendingGuest
  ): void {

    this.selectedGuest = guest;
    this.selectedWaitTime = 5;
    this.rejectReason = '';
    this.showRejectReason = false;
    this.showGuestPopup = true;
    this.showPendingBox = false;
  }

  closeGuestPopup(): void {
    this.selectedGuest = null;
    this.showGuestPopup = false;
    this.showRejectReason = false;
    this.rejectReason = '';
  }

  approveSelectedGuest(): void {
    if (!this.selectedGuest) {
      return;
    }

    this.isApproving = true;

    this.waitlistApi
      .approveGuest(
        this.restaurantId,
        this.selectedGuest.id,
        {
          estimatedWaitTime:
            this.selectedWaitTime
        }
      )
      .subscribe({
        next: (res) => {
          const approvedGuest =
            res.data;

          this.pendingGuests =
            this.pendingGuests.filter(
              guest =>
                guest.id !==
                approvedGuest.id
            );

          this.activeTab = 'WAITING';

          this.markRowChanged(
            approvedGuest.id
          );

          this.isApproving = false;

          this.closeGuestPopup();
          this.loadDashboardAllData(false);
        },

        error: () => {
          this.isApproving = false;

          alert(
            'Unable to approve guest'
          );
        }
      });
  }

  showRejectBox(): void {
    this.showRejectReason = true;
  }

  removequeue(guest: PendingGuest){
    this.selectedGuest = guest;
    this.rejectSelectedGuest()
  }

  rejectSelectedGuest(): void {
    if (!this.selectedGuest) {
      return;
    }

    this.isRejecting = true;

    this.waitlistApi
      .rejectGuest(
        this.restaurantId,
        this.selectedGuest.id
      )
      .subscribe({
        next: () => {
          this.pendingGuests =
            this.pendingGuests.filter(
              guest =>
                guest.id !==
                this.selectedGuest.id
            );

          this.isRejecting = false;

          this.closeGuestPopup();
          this.loadDashboardAllData(false);
        },

        error: () => {
          this.isRejecting = false;

          alert(
            'Unable to delete guest'
          );
        }
      });
  }

  notifyGuest(guest: any): void {
    if (!guest) {
      return;
    }

    this.isLoading = true;
    this.isNotifying = true;

    this.waitlistApi
      .notifyToGuest(
        this.restaurantId,
        guest.id,
        {
          estimatedWaitTime:
            guest.estimatedWaitTime,

          position:
            guest.position
        }
      )
      .subscribe({
        next: (res) => {
          this.isLoading = false;

          const notifiedGuest =
            res.data?.waitlist ??
            res.data;

          this.waitingGuests =
            this.waitingGuests.filter(
              item =>
                item.id !==
                notifiedGuest.id
            );

          this.activeTab = 'NOTIFIED';

          this.markRowChanged(
            notifiedGuest.id
          );

          this.isNotifying = false;

          this.loadDashboardAllData(false);
        },

        error: () => {
          this.isLoading = false;
          this.isNotifying = false;

          alert(
            'Unable to notify guest'
          );
        }
      });
  }

  openAvailableTableModal(
    guest: any
  ): void {

    this.selectedGuest = guest;
    this.selectedTable = null;

    this.openTables =
      this.tables.filter(
        table =>
          table.status === 'OPEN'
      );

    this.showTable = true;
  }

  closeAvailableTableModal(): void {
    this.showTable = false;
    this.selectedGuest = null;
    this.selectedTable = null;
  }

  seatGuest(): void {
    if (
      !this.selectedGuest ||
      !this.selectedTable
    ) {
      alert('Please select table');
      return;
    }

    this.isLoading = true;
    this.isSeating = true;

    forkJoin({
      tableStatus:
        this.waitlistApi.updateTableStatus(
          this.restaurantId,
          this.selectedTable.id,
          'OCCUPIED'
        ),

      seatedGuest:
        this.waitlistApi.seatedGuest(
          this.restaurantId,
          this.selectedGuest.id,
          {
            tableName:
              this.selectedTable.tableNumber
          }
        )
    }).subscribe({
      next: ({ seatedGuest }) => {
        this.isLoading = false;

        const seated =
          seatedGuest.data;

        this.notifiedGuests =
          this.notifiedGuests.filter(
            guest =>
              guest.id !== seated.id
          );

        this.activeTab = 'SEATED';

        this.markRowChanged(seated.id);

        this.isSeating = false;

        this.closeAvailableTableModal();
        this.loadDashboardAllData(false);

        this.notificationService
          .triggerRestaurantRefresh();
      },

      error: () => {
        this.isLoading = false;
        this.isSeating = false;

        alert(
          'Unable to seat guest'
        );
      }
    });
  }

  openLeaveConfirm(
    guest: any
  ): void {

    this.selectedGuest = guest;
    this.showLeaveConfirm = true;
  }

  closeLeaveConfirm(): void {
    this.showLeaveConfirm = false;
  }

  confirmLeaveWaitlist(): void {
    if (!this.selectedGuest) {
      return;
    }

    this.isLeaving = true;
    this.isLoading = true;

    const guestId =
      this.selectedGuest.id;

    const guestStatus =
      this.selectedGuest.status;

    this.waitlistApi
      .deleteGuestFromWaitlist(
        this.restaurantId,
        guestId
      )
      .subscribe({
        next: () => {
          this.isLeaving = false;
          this.isLoading = false;

          if (guestStatus === 'WAITING') {
            this.waitingGuests =
              this.waitingGuests.filter(
                guest =>
                  guest.id !== guestId
              );
          }

          if (guestStatus === 'NOTIFIED') {
            this.notifiedGuests =
              this.notifiedGuests.filter(
                guest =>
                  guest.id !== guestId
              );
          }

          this.activeTab = 'CANCELLED';

          this.markRowChanged(guestId);

          this.closeLeaveConfirm();
          this.loadDashboardAllData(false);
        },

        error: () => {
          this.isLeaving = false;
          this.isLoading = false;

          alert(
            'Unable to remove guest from waitlist'
          );
        }
      });
  }

  calculateTableStats(): void {
    const total =
      this.tables.length;

    const open =
      this.tables.filter(
        table =>
          table.status === 'OPEN'
      ).length;

    const occupied =
      this.tables.filter(
        table =>
          table.status === 'OCCUPIED'
      ).length;

    const reserved =
      this.tables.filter(
        table =>
          table.status === 'RESERVED'
      ).length;

    const cleaning =
      this.tables.filter(
        table =>
          table.status === 'CLEANING'
      ).length;

    this.tableStats = {
      total,
      open,
      occupied,
      reserved,
      cleaning
    };

    if (total === 0) {
      this.donutStyle =
        '#e5e7eb 0 100%';

      return;
    }

    const openEnd =
      (open / total) * 100;

    const occupiedEnd =
      openEnd +
      (occupied / total) * 100;

    const reservedEnd =
      occupiedEnd +
      (reserved / total) * 100;

    const cleaningEnd =
      reservedEnd +
      (cleaning / total) * 100;

    this.donutStyle = `
      #22c55e 0 ${openEnd}%,
      #6d28d9 ${openEnd}% ${occupiedEnd}%,
      #f59e0b ${occupiedEnd}% ${reservedEnd}%,
      #94a3b8 ${reservedEnd}% ${cleaningEnd}%
    `;
  }

  getStatusLabel(
    status: string
  ): string {

    switch (status) {
      case 'PENDING':
        return 'Pending';

      case 'WAITING':
        return 'Waiting';

      case 'NOTIFIED':
        return 'Notified';

      case 'SEATED':
        return 'Seated';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return status;
    }
  }

  getGuestInitials(
    name: string
  ): string {

    if (!name) {
      return 'G';
    }

    return name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  formatTime(
    date?: string
  ): string {

    if (!date) {
      return '-';
    }

    return new Date(
      date
    ).toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    );
  }

  markRowChanged(
    id: number
  ): void {

    this.recentChangedGuestId = id;

    setTimeout(() => {
      this.recentChangedGuestId = null;
    }, 1200);
  }

  trackByGuest(
    _: number,
    guest: DashboardLiveGuest
  ): number {

    return guest.id;
  }

  goToFloorMap(): void {
    this.router.navigate([
      '/restaurant/tables'
    ]);
  }

  logout(): void {
    localStorage.removeItem(
      'authToken'
    );

    this.router.navigate([
      '/login'
    ]);
  }

  get latestPendingGuest():
    PendingGuest | null {

    return this.pendingGuests.length
      ? this.pendingGuests[0]
      : null;
  }

  get currentTimeOnly(): string {
    return new Date().toLocaleTimeString(
      'en-IN',
      {
        timeZone: 'America/Toronto',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    );
  }

  get tableOpenPercentage(): number {
    if (!this.tableStats.total) {
      return 0;
    }

    return (
      this.tableStats.open /
      this.tableStats.total
    ) * 100;
  }

  getGuestSubText(
    guest: DashboardLiveGuest
  ): string {

    if (guest.notes) {
      return guest.notes;
    }

    if (
      guest.preference === 'PATIO' ||
      guest.preference === 'OUTDOOR'
    ) {
      return 'prefers outdoor seating';
    }

    return 'First time at Brothers Café';
  }

  getPreferenceLabel(
    preference?: string
  ): string {

    if (
      !preference ||
      preference === 'NO_PREFERENCE'
    ) {
      return 'No pref';
    }

    return preference
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(
        /\b\w/g,
        character =>
          character.toUpperCase()
      );
  }

  getPreferenceIcon(
    preference?: string
  ): string {

    if (preference === 'INDOOR') {
      return 'fa-regular fa-house';
    }

    if (
      preference === 'PATIO' ||
      preference === 'OUTDOOR'
    ) {
      return 'fa-regular fa-sun';
    }

    return 'fa-regular fa-building';
  }

  openNotificationPopup(
    guest: any
  ): void {

    this.selectedGuest = guest;
    this.shownotificationPopup = true;
  }

  closeNotificationPopup(): void {
    this.shownotificationPopup = false;
    this.selectedGuest = null;
  }

  get showMessageValidationError():
    boolean {

    return this.messageFormSubmitted;
  }

  openRemoveGuest(
    guest: DashboardLiveGuest
  ): void {

    this.selectedGuest = guest;
    this.showRejectReason = true;
    this.rejectReason = '';
    this.showGuestPopup = true;
  }

  toggleContactActions(
    guest: any,
    event: MouseEvent
  ): void {

    event.stopPropagation();

    if (
      this.selectedContactGuestId ===
      guest.id
    ) {
      this.selectedContactGuestId = null;
      return;
    }

    this.selectedContactGuestId =
      guest.id;
  }

  openCallingPopup(
    guest: any
  ): void {

    this.selectedContactGuestId = null;
    this.callingGuest = guest;
    this.showCallingPopup = true;

    const phoneNumber =
      guest?.guestPhone ||
      guest?.phone;

    if (!phoneNumber) {
      alert(
        'Guest phone number is not available'
      );

      this.closeCallingPopup();
      return;
    }


    this.waitlistApi
      .makecallToGuest(
        this.restaurantId,
        guest.id,
        {
          message:
            this.specificMessage
        }
      )
      .subscribe({
        next: () => {
        },

        error: () => {
          this.isLoading = false;
          this.showCallingPopup = false;

          alert(
            'Unable to make call'
          );
        }
      });
  }

  @HostListener('document:click')
  closeContactActions(): void {
    this.selectedContactGuestId = null;
  }

  closeCallingPopup(): void {
    this.showCallingPopup = false;
    this.callingGuest = null;
  }

  sendSmsToGuest(
    guest: any
  ): void {

    if (this.isSendingSms) {
      return;
    }

    const guestId =
      guest?.id;

    const phoneNumber =
      guest?.guestPhone ||
      guest?.phone;

    if (!guestId) {
      alert(
        'Guest details are not available'
      );

      return;
    }

    if (!phoneNumber) {
      alert(
        'Guest phone number is not available'
      );

      return;
    }

    this.isSendingSms = true;

    const payload = {
      phone: phoneNumber,

      message:
        `Hello ${guest?.guestName ||
        guest?.name ||
        'Guest'
        }, your table is ready.`
    };

    this.waitlistApi
      .sendNoficationToGuest(
        this.restaurantId,
        guestId,
        payload
      )
      .subscribe({
        next: (response: any) => {
          this.isSendingSms = false;

          this.selectedContactGuestId =
            null;

          if (
            response?.success === false
          ) {
            alert(
              response?.message ||
              'Unable to send SMS'
            );

            return;
          }

          alert(
            response?.message ||
            'SMS sent successfully'
          );
        },

        error: (error: any) => {
          this.isSendingSms = false;

          alert(
            error?.error?.message ||
            error?.message ||
            'Unable to send SMS. Please try again.'
          );
        }
      });
  }

  openRestoremethod(
    guest: any
  ): void {

    this.waitlistApi
      .rejoinGuestApi(
        this.restaurantId,
        guest.id
      )
      .subscribe({
        next: (response) => {
          alert(
            response?.message ||
            'Restore guest successfully'
          );

          this.loadDashboardAllData(false);
        },

        error: (error) => {
          alert(
            error?.error?.message ||
            error?.message ||
            'Unable to restore guest. Please try again.'
          );
        }
      });
  }

  /*
   * Customer reply functions.
   */

  hasCustomerReply(
    guest: DashboardLiveGuest | null
  ): boolean {

    return (
      this.getCustomerReplyValue(
        guest
      ) !== ''
    );
  }

  getCustomerReplyText(
    guest: DashboardLiveGuest | null
  ): string {

    const reply =
      this.getCustomerReplyValue(
        guest
      );

    switch (reply) {
      case '1':
        return 'On my way';

      case '2':
        return 'Arriving in 5 minutes';

      case '3':
        return 'Unable to join';

      default:
        return '';
    }
  }

  getCustomerReplyClass(
    guest: DashboardLiveGuest | null
  ): string {

    const reply =
      this.getCustomerReplyValue(
        guest
      );

    switch (reply) {
      case '1':
        return 'reply-coming';

      case '2':
        return 'reply-delayed';

      case '3':
        return 'reply-unavailable';

      default:
        return '';
    }
  }

  getCustomerReplyPreviewIcon(
    guest: DashboardLiveGuest | null
  ): string {

    const reply =
      this.getCustomerReplyValue(
        guest
      );

    switch (reply) {
      case '1':
        return 'fa-solid fa-car-side';

      case '2':
        return 'fa-solid fa-clock';

      case '3':
        return 'fa-solid fa-circle-xmark';

      default:
        return 'fa-solid fa-reply';
    }
  }

  private getCustomerReplyValue(
    guest: DashboardLiveGuest | null
  ): CustomerReplyType {

    if (!guest) {
      return '';
    }

    /*
     * These fields may contain the actual
     * customer response.
     */
    const replyCandidates: unknown[] = [
      guest.latestCustomerReply,
      guest.customerReplyDescription,
      guest.voiceReplyDigits,
      guest.latestVoiceReply
    ];

    for (
      const candidate
      of replyCandidates
    ) {
      const normalizedValue =
        this.normalizeCustomerReply(
          candidate
        );

      const replyType =
        this.convertReplyToOption(
          normalizedValue
        );

      if (replyType) {
        return replyType;
      }
    }

    /*
     * customerReplySid is normally an external
     * SMS identifier. Use it only when its
     * entire value is exactly 1, 2 or 3.
     */
    const replySid =
      this.normalizeCustomerReply(
        guest.customerReplySid
      );

    if (
      replySid === '1' ||
      replySid === '2' ||
      replySid === '3'
    ) {
      return replySid;
    }

    return '';
  }

  private normalizeCustomerReply(
    value: unknown
  ): string {

    return String(value ?? '')
      .replace(/[️⃣️]/g, '')
      .trim()
      .toLowerCase();
  }

  private convertReplyToOption(
    value: string
  ): CustomerReplyType {

    switch (value) {
      case '1':
      case 'on my way':
        return '1';

      case '2':
      case 'arriving in 5 minutes':
        return '2';

      case '3':
      case 'unable to join':
        return '3';

      default:
        return '';
    }
  }

  private getCustomerReplySignature(
    guest: DashboardLiveGuest
  ): string {

    const replyValue =
      this.getCustomerReplyValue(
        guest
      );

    if (!replyValue) {
      return '';
    }

    return [
      guest.id,
      replyValue,
      guest.customerReplyReceivedAt ??
      ''
    ].join('|');
  }

  private detectNewCustomerReplies(
    guests: DashboardLiveGuest[]
  ): void {

    guests.forEach(
      (
        guest:
          DashboardLiveGuest
      ) => {

        const replyValue =
          this.getCustomerReplyValue(
            guest
          );

        const currentSignature =
          this.getCustomerReplySignature(
            guest
          );

        const previousSignature =
          this.previousCustomerReplies.get(
            guest.id
          );

        /*
         * On initial page load, remember replies
         * that already exist without shaking.
         */
        if (
          !this
            .customerReplyInitialLoadCompleted
        ) {
          if (
            replyValue &&
            currentSignature
          ) {
            this.previousCustomerReplies.set(
              guest.id,
              currentSignature
            );
          }

          return;
        }

        /*
         * Shake only when a new valid reply
         * appears or the reply changes.
         */
        if (
          replyValue &&
          currentSignature &&
          currentSignature !==
          previousSignature
        ) {
          this.previousCustomerReplies.set(
            guest.id,
            currentSignature
          );

          this.triggerGuestReplyAnimation(
            guest.id
          );
        }
      }
    );

    this.customerReplyInitialLoadCompleted =
      true;
  }

  private triggerGuestReplyAnimation(
    guestId: number
  ): void {

    const existingTimeout =
      this.replyShakeTimeouts.get(
        guestId
      );

    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    /*
     * Remove and add the ID again so a second
     * customer reply can restart the animation.
     */
    this.shakingGuestIds.delete(
      guestId
    );

    setTimeout(() => {
      this.shakingGuestIds.add(
        guestId
      );
    });

    const timeout =
      setTimeout(() => {
        this.shakingGuestIds.delete(
          guestId
        );

        this.replyShakeTimeouts.delete(
          guestId
        );
      }, 1400);

    this.replyShakeTimeouts.set(
      guestId,
      timeout
    );
  }

  /*
   * Seated guest edit functions.
   */

  get currentSeatedPartySize():
    number {

    return Number(
      this.selectedSeatedGuest
        ?.partySize || 0
    );
  }

  get requiredPartyCapacity():
    number {

    return (
      this.currentSeatedPartySize +
      Number(
        this.additionalGuestCount ||
        0
      )
    );
  }

  get suitableOpenTables():
    any[] {

    return this.openTables.filter(
      (table: any) =>
        Number(table.capacity) >=
        this.requiredPartyCapacity
    );
  }

  get currentSeatedTable():
    any | null {

    const tableName =
      this.selectedSeatedGuest
        ?.tableName;

    if (!tableName) {
      return null;
    }

    return (
      this.tables.find(
        (table: any) =>
          table.tableNumber ===
          tableName
      ) || null
    );
  }

  get hasSuitableOpenTable():
    boolean {

    return (
      this.suitableOpenTables.length >
      0
    );
  }

  openEditSeatedGuestModal(
    guest: DashboardLiveGuest
  ): void {

    this.selectedSeatedGuest =
      guest;

    this.additionalGuestCount = 0;
    this.editWaitingMinutes = null;
    this.selectedEditTable = null;
    this.editSeatedAction = 'RESEAT';

    this.showEditSeatedGuestModal =
      true;
  }

  closeEditSeatedGuestModal(): void {
    if (this.isUpdatingSeatedGuest) {
      return;
    }

    this.showEditSeatedGuestModal =
      false;

    this.selectedSeatedGuest = null;
    this.selectedEditTable = null;
    this.additionalGuestCount = 0;
    this.editWaitingMinutes = null;
    this.editSeatedAction = 'RESEAT';
  }

  decreaseAdditionalGuests(): void {
    if (
      this.additionalGuestCount > 0
    ) {
      this.additionalGuestCount--;

      this.checkSelectedEditTableCapacity();
    }
  }

  increaseAdditionalGuests(): void {
    this.additionalGuestCount++;

    this.checkSelectedEditTableCapacity();
  }

  onAdditionalGuestCountChange(): void {
    if (
      this.additionalGuestCount ===
      null ||
      this.additionalGuestCount < 0
    ) {
      this.additionalGuestCount = 0;
    }

    this.checkSelectedEditTableCapacity();
  }

  private checkSelectedEditTableCapacity():
    void {

    if (
      this.selectedEditTable &&
      Number(
        this.selectedEditTable.capacity
      ) <
      this.requiredPartyCapacity
    ) {
      this.selectedEditTable = null;
    }
  }

  submitSeatedGuestEdit(): void {
    if (!this.selectedSeatedGuest) {
      return;
    }

    if (
      this.additionalGuestCount <= 0
    ) {
      alert(
        'Please enter the number of additional guests'
      );

      return;
    }

    if (
      this.editSeatedAction ===
      'RESEAT'
    ) {
      this.reseatGuestAtLargerTable();
      return;
    }

    this.moveSeatedGuestBackToWaiting();
  }

  private reseatGuestAtLargerTable():
    void {

    if (
      !this.selectedSeatedGuest ||
      !this.selectedEditTable
    ) {
      alert(
        'Please select an available table'
      );

      return;
    }

    if (
      Number(
        this.selectedEditTable.capacity
      ) <
      this.requiredPartyCapacity
    ) {
      alert(
        'The selected table does not have enough seats'
      );

      return;
    }

    const guestName =
      this.selectedSeatedGuest
        .guestName;

    const oldTable =
      this.currentSeatedTable;

    this.isUpdatingSeatedGuest =
      true;

    this.isLoading = true;

    const requests:
      Record<string, any> = {

      newTableStatus:
        this.waitlistApi
          .updateTableStatus(
            this.restaurantId,
            this.selectedEditTable.id,
            'OCCUPIED'
          ),

      seatedGuest:
        this.waitlistApi
          .updateSeatedGuest(
            this.restaurantId,
            this.selectedSeatedGuest.id,
            {
              partySize:
                this.requiredPartyCapacity,

              tableName:
                this.selectedEditTable
                  .tableNumber
            }
          )
    };

    if (
      oldTable &&
      oldTable.id !==
      this.selectedEditTable.id
    ) {
      requests['oldTableStatus'] =
        this.waitlistApi
          .updateTableStatus(
            this.restaurantId,
            oldTable.id,
            'OPEN'
          );
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.isUpdatingSeatedGuest =
          false;

        this.isLoading = false;

        this.closeEditSeatedGuestModal();
        this.loadDashboardAllData(false);

        this.notificationService
          .triggerRestaurantRefresh();

        alert(
          `${guestName} moved successfully`
        );
      },

      error: (error: any) => {
        this.isUpdatingSeatedGuest =
          false;

        this.isLoading = false;

        alert(
          error?.error?.message ||
          'Unable to update the seated guest'
        );
      }
    });
  }

  private moveSeatedGuestBackToWaiting():
    void {

    if (!this.selectedSeatedGuest) {
      return;
    }

    if (
      !this.editWaitingMinutes ||
      this.editWaitingMinutes <= 0
    ) {
      alert(
        'Please enter the estimated waiting time'
      );

      return;
    }

    const guestName =
      this.selectedSeatedGuest
        .guestName;

    const oldTable =
      this.currentSeatedTable;

    this.isUpdatingSeatedGuest =
      true;

    this.isLoading = true;

    const requests:
      Record<string, any> = {

      waitingGuest:
        this.waitlistApi
          .moveSeatedGuestToWaiting(
            this.restaurantId,
            this.selectedSeatedGuest.id,
            {
              partySize:
                this.requiredPartyCapacity,

              estimatedWaitTime:
                Number(
                  this.editWaitingMinutes
                )
            }
          )
    };

    if (oldTable) {
      requests['oldTableStatus'] =
        this.waitlistApi
          .updateTableStatus(
            this.restaurantId,
            oldTable.id,
            'OPEN'
          );
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.isUpdatingSeatedGuest =
          false;

        this.isLoading = false;

        this.closeEditSeatedGuestModal();

        this.activeTab = 'WAITING';

        this.loadDashboardAllData(false);

        this.notificationService
          .triggerRestaurantRefresh();

        alert(
          `${guestName} moved back to the waiting list`
        );
      },

      error: (error: any) => {
        this.isUpdatingSeatedGuest =
          false;

        this.isLoading = false;

        alert(
          error?.error?.message ||
          'Unable to move the guest to waiting'
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();

    if (this.clockInterval) {
      clearInterval(
        this.clockInterval
      );
    }

    if (this.refreshInterval) {
      clearInterval(
        this.refreshInterval
      );
    }

    this.replyShakeTimeouts.forEach(
      timeout =>
        clearTimeout(timeout)
    );

    this.replyShakeTimeouts.clear();
  }
}
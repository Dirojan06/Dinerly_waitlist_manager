import {
  CdkDragEnd
} from '@angular/cdk/drag-drop';

import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  Subscription
} from 'rxjs';

import {
  addTabletoRestaurantRequest,
  mergerTableRequest,
  tableList,
  unMergerTableRequest
} from 'src/app/models/waitlist-api-guest-to-restaurant.model';

import {
  WaitlistApiRestaurantService
} from 'src/app/services/waitlist-api-restaurant.service';

import {
  WaitlistAuthService
} from 'src/app/services/waitlist-auth.service';

import {
  WaitlistRestaurantModalService
} from 'src/app/services/waitlist-restaurant-modal.service';


type TableMode =
  | 'LIVE'
  | 'MERGE'
  | 'UNMERGE'
  | 'ASSIGN'
  | 'EDIT';


type FixtureType =
  | 'WALL'
  | 'BAR'
  | 'HOST';


interface FloorTable extends tableList {
  x?: number;
  y?: number;
  rotation?: number;
  customName?: string;
  server?: string;
  mergedTableId?: number | null;
}


interface FloorFixture {
  id: number;
  type: FixtureType;
  label: string;
  x: number;
  y: number;
  rotation: number;
}


@Component({
  selector: 'app-waitlist-tables',
  templateUrl:
    './waitlist-tables.component.html',
  styleUrls: [
    './waitlist-tables.component.css'
  ]
})
export class WaitlistTablesComponent
  implements OnInit, OnDestroy {

  tables: FloorTable[] = [];

  fixtures: FloorFixture[] = [];

  restaurantId = 0;

  restaurantName = '';

  isLoading = false;

  isMerging = false;

  isUnmerging = false;

  activeMode: TableMode = 'LIVE';

  selectedTable:
    FloorTable | null = null;

  selectedTableIds: number[] = [];

  selectedServer = '';

  servers = [
    'Arun',
    'Maya',
    'Daniel',
    'Priya'
  ];

  private readonly sub =
    new Subscription();


  constructor(
    private waitlistService:
      WaitlistApiRestaurantService,

    private authService:
      WaitlistAuthService,

    public modalService:
      WaitlistRestaurantModalService
  ) { }


  ngOnInit(): void {

    this.restaurantId =
      this.authService
        .getRestaurantId();

    this.restaurantName =
      this.authService
        .getRestaurantName();

    if (!this.restaurantId) {

      alert(
        'Restaurant information is missing. Please log in again.'
      );

      this.authService
        .signOutRestaurant();

      return;
    }

    this.getRestaurantTables();
  }


  /* =====================================================
     COUNTS
  ====================================================== */

  get openCount(): number {

    return this.tables.filter(
      table =>
        table.status === 'OPEN'
    ).length;
  }


  get seatedCount(): number {

    return this.tables.filter(
      table =>
        table.status === 'OCCUPIED'
    ).length;
  }


  get reservedCount(): number {

    return this.tables.filter(
      table =>
        table.status === 'RESERVED'
    ).length;
  }


  get dirtyCount(): number {

    return this.tables.filter(
      table =>
        table.status === 'DIRTY' ||
        table.status === 'CLEANING'
    ).length;
  }


  get openProgress(): number {

    if (!this.tables.length) {
      return 0;
    }

    return (
      this.openCount /
      this.tables.length
    ) * 100;
  }


  get restaurantInitial(): string {

    const name =
      this.restaurantName.trim();

    if (!name) {
      return 'R';
    }

    return name
      .charAt(0)
      .toUpperCase();
  }


  get currentTimeOnly(): string {

    return new Date()
      .toLocaleTimeString(
        'en-CA',
        {
          timeZone:
            'America/Toronto',

          hour:
            '2-digit',

          minute:
            '2-digit',

          hour12: true
        }
      );
  }


  /* =====================================================
     GET TABLES
  ====================================================== */

  getRestaurantTables(): void {

    if (!this.restaurantId) {
      return;
    }

    this.isLoading = true;

    const request =
      this.waitlistService
        .getRestaurantTableslist(
          this.restaurantId
        )
        .subscribe({
          next: response => {

            this.isLoading = false;

            const apiTables:
              tableList[] =
              response?.data || [];

            this.tables =
              apiTables.map(
                (
                  table,
                  index
                ): FloorTable => {

                  const existingTable =
                    this.tables.find(
                      currentTable =>
                        currentTable.id ===
                        table.id
                    );

                  return {
                    ...table,

                    x:
                      existingTable?.x ??
                      this.getDefaultX(
                        index
                      ),

                    y:
                      existingTable?.y ??
                      this.getDefaultY(
                        index
                      ),

                    rotation:
                      existingTable
                        ?.rotation ??
                      0,

                    customName:
                      existingTable
                        ?.customName,

                    server:
                      existingTable
                        ?.server,

                    mergedTableId:
                      table
                        .mergedTableId ??
                      null
                  };
                }
              );

            this.selectedTable =
              null;

            this.selectedTableIds =
              [];
          },

          error: error => {

            this.isLoading = false;

            console.error(
              'Unable to load tables:',
              error
            );

            alert(
              error?.error?.message ||
              'Unable to load the tables'
            );
          }
        });

    this.sub.add(request);
  }


  reloadTableList(): void {

    this.getRestaurantTables();
  }


  /* =====================================================
     MODES
  ====================================================== */

  setMode(
    mode: TableMode
  ): void {

    if (
      this.isMerging ||
      this.isUnmerging
    ) {
      return;
    }

    if (
      this.activeMode === mode
    ) {
      this.cancelMode();

      return;
    }

    this.activeMode = mode;

    this.selectedTableIds = [];

    this.selectedTable = null;

    this.selectedServer = '';
  }


  toggleEditMode(): void {

    if (
      this.isMerging ||
      this.isUnmerging
    ) {
      return;
    }

    this.activeMode =
      this.activeMode === 'EDIT'
        ? 'LIVE'
        : 'EDIT';

    this.selectedTableIds = [];

    this.selectedTable = null;
  }


  cancelMode(): void {

    if (
      this.isMerging ||
      this.isUnmerging
    ) {
      return;
    }

    this.activeMode = 'LIVE';

    this.selectedTableIds = [];

    this.selectedTable = null;

    this.selectedServer = '';
  }


  /* =====================================================
     TABLE SELECTION
  ====================================================== */

  onTableClick(
    table: FloorTable
  ): void {

    if (
      this.activeMode === 'MERGE'
    ) {
      this.selectForMerge(table);

      return;
    }

    if (
      this.activeMode === 'UNMERGE'
    ) {
      this.selectForUnmerge(
        table
      );

      return;
    }

    if (
      this.activeMode === 'ASSIGN'
    ) {
      this.toggleSelected(
        table.id
      );

      return;
    }

    if (
      this.activeMode === 'EDIT'
    ) {
      this.selectedTable =
        this.selectedTable?.id ===
        table.id
          ? null
          : table;

      return;
    }

    this.selectedTable =
      this.selectedTable?.id ===
      table.id
        ? null
        : table;
  }


  toggleSelected(
    tableId: number
  ): void {

    if (
      this.selectedTableIds.includes(
        tableId
      )
    ) {
      this.selectedTableIds =
        this.selectedTableIds
          .filter(
            id =>
              id !== tableId
          );

      return;
    }

    this.selectedTableIds = [
      ...this.selectedTableIds,
      tableId
    ];
  }


  isSelected(
    tableId: number
  ): boolean {

    return this.selectedTableIds
      .includes(
        tableId
      );
  }


  isMerged(
    tableId: number
  ): boolean {

    const table =
      this.tables.find(
        item =>
          item.id === tableId
      );

    return (
      table?.mergedTableId !== null &&
      table?.mergedTableId !== undefined
    );
  }


  /* =====================================================
     MERGE TABLES
  ====================================================== */

  selectForMerge(
    table: FloorTable
  ): void {

    if (
      table.status !== 'OPEN'
    ) {
      alert(
        'Only open tables can be merged.'
      );

      return;
    }

    if (
      this.isMerged(table.id)
    ) {
      alert(
        'This table is already merged. Unmerge it before merging again.'
      );

      return;
    }

    if (
      this.selectedTableIds
        .includes(
          table.id
        )
    ) {
      this.selectedTableIds =
        this.selectedTableIds
          .filter(
            id =>
              id !== table.id
          );

      return;
    }

    if (
      this.selectedTableIds
        .length >= 2
    ) {
      alert(
        'You can merge only two tables at a time.'
      );

      return;
    }

    this.selectedTableIds = [
      ...this.selectedTableIds,
      table.id
    ];
  }


  confirmMerge(): void {

    if (
      this.selectedTableIds
        .length !== 2
    ) {
      alert(
        'Please select exactly two open tables.'
      );

      return;
    }

    const [
      firstTableId,
      secondTableId
    ] = this.selectedTableIds;

    const firstTable =
      this.tables.find(
        table =>
          table.id ===
          firstTableId
      );

    const secondTable =
      this.tables.find(
        table =>
          table.id ===
          secondTableId
      );

    if (
      !firstTable ||
      !secondTable
    ) {
      alert(
        'Selected table information is missing.'
      );

      return;
    }

    if (
      firstTable.status !== 'OPEN' ||
      secondTable.status !== 'OPEN'
    ) {
      alert(
        'Both tables must be open before merging.'
      );

      return;
    }

    if (
      this.isMerged(
        firstTable.id
      ) ||
      this.isMerged(
        secondTable.id
      )
    ) {
      alert(
        'One of the selected tables is already merged.'
      );

      return;
    }

    const payload:
      mergerTableRequest = {

      tableId:
        firstTable.id,

      mergedTableId:
        secondTable.id
    };

    this.isMerging = true;

    this.isLoading = true;

    const request =
      this.waitlistService
        .mergeTables(
          this.restaurantId,
          payload
        )
        .subscribe({
          next: response => {

            this.isMerging =
              false;

            this.isLoading =
              false;

            if (
              response?.success ===
              false
            ) {
              alert(
                response?.message ||
                'Unable to merge tables'
              );

              return;
            }

            this.activeMode =
              'LIVE';

            this.selectedTableIds =
              [];

            this.selectedTable =
              null;

            alert(
              response?.message ||
              `${firstTable.tableNumber} and ${secondTable.tableNumber} merged successfully`
            );

            this.getRestaurantTables();
          },

          error: error => {

            this.isMerging =
              false;

            this.isLoading =
              false;

            console.error(
              'Merge tables error:',
              error
            );

            alert(
              error?.error?.message ||
              error?.message ||
              'Unable to merge tables'
            );
          }
        });

    this.sub.add(request);
  }


  /* =====================================================
     UNMERGE TABLES
  ====================================================== */

  selectForUnmerge(
    table: FloorTable
  ): void {

    if (
      !this.isMerged(table.id)
    ) {
      alert(
        'Select a table that is currently merged.'
      );

      return;
    }

    if (
      this.selectedTableIds
        .includes(
          table.id
        )
    ) {
      this.selectedTableIds =
        this.selectedTableIds
          .filter(
            id =>
              id !== table.id
          );

      return;
    }

    if (
      this.selectedTableIds
        .length >= 2
    ) {
      alert(
        'You can unmerge only two tables at a time.'
      );

      return;
    }

    this.selectedTableIds = [
      ...this.selectedTableIds,
      table.id
    ];
  }


  confirmUnmerge(): void {

    if (
      this.selectedTableIds
        .length !== 2
    ) {
      alert(
        'Please select exactly two merged tables.'
      );

      return;
    }

    const [
      firstTableId,
      secondTableId
    ] = this.selectedTableIds;

    const firstTable =
      this.tables.find(
        table =>
          table.id ===
          firstTableId
      );

    const secondTable =
      this.tables.find(
        table =>
          table.id ===
          secondTableId
      );

    if (
      !firstTable ||
      !secondTable
    ) {
      alert(
        'Selected table information is missing.'
      );

      return;
    }

    if (
      !this.isMerged(
        firstTable.id
      ) ||
      !this.isMerged(
        secondTable.id
      )
    ) {
      alert(
        'Both selected tables must currently be merged.'
      );

      return;
    }

    const payload:
      unMergerTableRequest = {

      tableId:
        firstTable.id,

      mergedTableId:
        secondTable.id
    };

    this.isUnmerging = true;

    this.isLoading = true;

    const request =
      this.waitlistService
        .unmergeTables(
          this.restaurantId,
          payload
        )
        .subscribe({
          next: response => {

            this.isUnmerging =
              false;

            this.isLoading =
              false;

            if (
              response?.success ===
              false
            ) {
              alert(
                response?.message ||
                'Unable to unmerge tables'
              );

              return;
            }

            this.activeMode =
              'LIVE';

            this.selectedTableIds =
              [];

            this.selectedTable =
              null;

            alert(
              response?.message ||
              `${firstTable.tableNumber} and ${secondTable.tableNumber} unmerged successfully`
            );

            this.getRestaurantTables();
          },

          error: error => {

            this.isUnmerging =
              false;

            this.isLoading =
              false;

            console.error(
              'Unmerge tables error:',
              error
            );

            alert(
              error?.error?.message ||
              error?.message ||
              'Unable to unmerge tables'
            );
          }
        });

    this.sub.add(request);
  }


  /* =====================================================
     ASSIGN SERVER
  ====================================================== */

  assignServer(): void {

    if (
      !this.selectedTableIds.length
    ) {
      alert(
        'Please select at least one table.'
      );

      return;
    }

    this.tables =
      this.tables.map(
        table => {

          if (
            this.selectedTableIds
              .includes(
                table.id
              )
          ) {
            return {
              ...table,

              server:
                this.selectedServer ||
                'Unassigned'
            };
          }

          return table;
        }
      );

    this.cancelMode();
  }


  /* =====================================================
     DRAG AND ROTATE
  ====================================================== */

  onDragEnd(
    event: CdkDragEnd,
    table: FloorTable
  ): void {

    if (
      table.status === 'OCCUPIED'
    ) {
      return;
    }

    const position =
      event.source
        .getFreeDragPosition();

    table.x =
      this.snap(
        position.x
      );

    table.y =
      this.snap(
        position.y
      );

    event.source
      .setFreeDragPosition({
        x: table.x,
        y: table.y
      });
  }


  onFixtureDragEnd(
    event: CdkDragEnd,
    fixture: FloorFixture
  ): void {

    const position =
      event.source
        .getFreeDragPosition();

    fixture.x =
      this.snap(
        position.x
      );

    fixture.y =
      this.snap(
        position.y
      );

    event.source
      .setFreeDragPosition({
        x: fixture.x,
        y: fixture.y
      });
  }


  snap(
    value: number
  ): number {

    const gridSize = 10;

    return Math.round(
      value /
      gridSize
    ) * gridSize;
  }


  rotateTable(
    table: FloorTable,
    event: MouseEvent
  ): void {

    event.stopPropagation();

    table.rotation =
      (
        (
          table.rotation ||
          0
        ) + 90
      ) % 360;
  }


  rotateFixture(
    fixture: FloorFixture,
    event: MouseEvent
  ): void {

    event.stopPropagation();

    fixture.rotation =
      (
        fixture.rotation +
        90
      ) % 360;
  }


  /* =====================================================
     ADD TABLE
  ====================================================== */

  getNextTableNumber(): string {

    const maximumNumber =
      this.tables
        .map(
          table => {

            const match =
              table.tableNumber
                ?.match(/\d+/);

            return match
              ? Number(match[0])
              : 0;
          }
        )
        .reduce(
          (
            maximum,
            current
          ) =>
            Math.max(
              maximum,
              current
            ),
          0
        );

    return `T${maximumNumber + 1}`;
  }


  addTable(
    capacity: number
  ): void {

    const payload:
      addTabletoRestaurantRequest = {

      tableNumber:
        this.getNextTableNumber(),

      capacity
    };

    this.isLoading = true;

    const request =
      this.waitlistService
        .addTabletoRestaurant(
          this.restaurantId,
          payload
        )
        .subscribe({
          next: response => {

            this.isLoading = false;

            if (
              response?.success ===
              false
            ) {
              alert(
                response?.message ||
                'Unable to add table'
              );

              return;
            }

            alert(
              response?.message ||
              'Table added successfully'
            );

            this.getRestaurantTables();
          },

          error: error => {

            this.isLoading = false;

            alert(
              error?.error?.message ||
              'Unable to add table'
            );
          }
        });

    this.sub.add(request);
  }


  /* =====================================================
     TABLE STATUS
  ====================================================== */

  getStatusOptions(
    table: FloorTable
  ): {
    label: string;
    value: string;
  }[] {

    switch (table.status) {

      case 'OPEN':
        return [
          {
            label:
              'Reserve',

            value:
              'RESERVED'
          },
          {
            label:
              'Occupied',

            value:
              'OCCUPIED'
          }
        ];

      case 'OCCUPIED':
        return [
          {
            label:
              'Open',

            value:
              'OPEN'
          },
          {
            label:
              'Need Clean',

            value:
              'DIRTY'
          }
        ];

      case 'RESERVED':
        return [
          {
            label:
              'Open',

            value:
              'OPEN'
          },
          {
            label:
              'Occupied',

            value:
              'OCCUPIED'
          }
        ];

      case 'DIRTY':
      case 'CLEANING':
        return [
          {
            label:
              'Open',

            value:
              'OPEN'
          },
          {
            label:
              'Occupied',

            value:
              'OCCUPIED'
          }
        ];

      default:
        return [];
    }
  }


  changeTableStatus(
    table: FloorTable,
    status: string
  ): void {

    this.isLoading = true;

    const request =
      this.waitlistService
        .updateTableStatus(
          this.restaurantId,
          table.id,
          status
        )
        .subscribe({
          next: response => {

            this.isLoading = false;

            if (
              response?.success ===
              false
            ) {
              alert(
                response?.message ||
                'Unable to update table status'
              );

              return;
            }

            const updatedStatus =
              response?.data?.status ||
              status;

            this.tables =
              this.tables.map(
                currentTable => {

                  if (
                    currentTable.id ===
                    table.id
                  ) {
                    return {
                      ...currentTable,

                      status:
                        updatedStatus
                    };
                  }

                  return currentTable;
                }
              );

            this.selectedTable =
              null;

            alert(
              response?.message ||
              'Table status updated successfully'
            );
          },

          error: error => {

            this.isLoading = false;

            alert(
              error?.error?.message ||
              'Unable to update table status'
            );
          }
        });

    this.sub.add(request);
  }


  /* =====================================================
     FIXTURES
  ====================================================== */

  addFixture(
    type: FixtureType
  ): void {

    this.fixtures.push({
      id:
        Date.now(),

      type,

      label:
        type === 'HOST'
          ? 'HOST STAND'
          : type,

      x:
        300,

      y:
        250,

      rotation:
        0
    });
  }


  /* =====================================================
     REMOVE TABLE
  ====================================================== */

  removeTable(
    table: FloorTable
  ): void {

    if (
      table.status === 'OCCUPIED'
    ) {
      alert(
        'Occupied table cannot be removed.'
      );

      return;
    }

    if (
      this.isMerged(table.id)
    ) {
      alert(
        'Unmerge this table before removing it.'
      );

      return;
    }

    /*
     * This currently removes the table only
     * from the frontend.
     *
     * Replace this with your delete-table API
     * when the backend endpoint is available.
     */
    this.tables =
      this.tables.filter(
        currentTable =>
          currentTable.id !==
          table.id
      );

    this.selectedTable = null;
  }


  /* =====================================================
     CHAIRS
  ====================================================== */

  getChairs(
    capacity: number
  ): {
    position: string;
    index: number;
    total: number;
  }[] {

    if (capacity === 2) {

      return [
        {
          position: 'top',
          index: 0,
          total: 1
        },
        {
          position: 'bottom',
          index: 0,
          total: 1
        }
      ];
    }

    if (capacity === 4) {

      return [
        {
          position: 'top',
          index: 0,
          total: 2
        },
        {
          position: 'top',
          index: 1,
          total: 2
        },
        {
          position: 'bottom',
          index: 0,
          total: 2
        },
        {
          position: 'bottom',
          index: 1,
          total: 2
        }
      ];
    }

    if (capacity === 6) {

      return [
        {
          position: 'top',
          index: 0,
          total: 3
        },
        {
          position: 'top',
          index: 1,
          total: 3
        },
        {
          position: 'top',
          index: 2,
          total: 3
        },
        {
          position: 'bottom',
          index: 0,
          total: 3
        },
        {
          position: 'bottom',
          index: 1,
          total: 3
        },
        {
          position: 'bottom',
          index: 2,
          total: 3
        }
      ];
    }

    if (capacity === 8) {

      return [
        {
          position: 'top',
          index: 0,
          total: 3
        },
        {
          position: 'top',
          index: 1,
          total: 3
        },
        {
          position: 'top',
          index: 2,
          total: 3
        },
        {
          position: 'bottom',
          index: 0,
          total: 3
        },
        {
          position: 'bottom',
          index: 1,
          total: 3
        },
        {
          position: 'bottom',
          index: 2,
          total: 3
        },
        {
          position: 'left',
          index: 0,
          total: 1
        },
        {
          position: 'right',
          index: 0,
          total: 1
        }
      ];
    }

    return [
      {
        position: 'top',
        index: 0,
        total: 1
      },
      {
        position: 'bottom',
        index: 0,
        total: 1
      }
    ];
  }


  /* =====================================================
     DEFAULT POSITIONS
  ====================================================== */

  getDefaultX(
    index: number
  ): number {

    const gap = 150;

    return (
      40 +
      (
        index % 7
      ) * gap
    );
  }


  getDefaultY(
    index: number
  ): number {

    const gap = 130;

    return (
      45 +
      Math.floor(
        index / 7
      ) * gap
    );
  }


  trackById(
    _: number,
    table: FloorTable
  ): number {

    return table.id;
  }


  ngOnDestroy(): void {

    this.sub.unsubscribe();
  }

}
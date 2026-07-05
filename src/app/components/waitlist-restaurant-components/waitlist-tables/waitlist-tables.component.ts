import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { addTabletoRestaurantRequest, tableList } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';
import { WaitlistRestaurantModalService } from 'src/app/services/waitlist-restaurant-modal.service';

type TableMode = 'LIVE' | 'MERGE' | 'ASSIGN' | 'EDIT';
type FixtureType = 'WALL' | 'BAR' | 'HOST';

interface FloorTable extends tableList {
  x?: number;
  y?: number;
  rotation?: number;
  customName?: string;
  server?: string;
  mergeGroupId?: string | null;
}

interface FloorFixture {
  id: number;
  type: FixtureType;
  label: string;
  x: number;
  y: number;
  rotation: number;
}

interface MergeLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

@Component({
  selector: 'app-waitlist-tables',
  templateUrl: './waitlist-tables.component.html',
  styleUrls: ['./waitlist-tables.component.css']
})
export class WaitlistTablesComponent implements OnInit, OnDestroy {

  tables: FloorTable[] = [];
  fixtures: FloorFixture[] = [];
  isLoading = false;
  restaurantId = 1;
  activeMode: TableMode = 'LIVE';

  selectedTable: FloorTable | null = null;
  selectedTableIds: number[] = [];

  selectedServer = '';
  servers = ['Arun', 'Maya', 'Daniel', 'Priya'];

  showRequestBanner = true;

  mergedGroups: string[] = [];

  private sub = new Subscription();

  constructor(
    private waitlistService: WaitlistApiRestaurantService,
    public modalService: WaitlistRestaurantModalService
  ) { }

  ngOnInit(): void {
    this.getRestaurantTables();
  }

  get openCount(): number {
    return this.tables.filter(t => t.status === 'OPEN').length;
  }

  get seatedCount(): number {
    return this.tables.filter(t => t.status === 'OCCUPIED').length;
  }

  get reservedCount(): number {
    return this.tables.filter(t => t.status === 'RESERVED').length;
  }

  get dirtyCount(): number {
    return this.tables.filter(t => t.status === 'DIRTY').length;
  }

  get openProgress(): number {
    if (!this.tables.length) return 0;
    return (this.openCount / this.tables.length) * 100;
  }

  get mergeLines(): MergeLine[] {
    const lines: MergeLine[] = [];

    this.mergedGroups.forEach(groupId => {
      const groupTables = this.tables.filter(t => t.mergeGroupId === groupId);

      for (let i = 0; i < groupTables.length - 1; i++) {
        const a = groupTables[i];
        const b = groupTables[i + 1];

        lines.push({
          x1: (a.x || 0) + 45,
          y1: (a.y || 0) + 35,
          x2: (b.x || 0) + 45,
          y2: (b.y || 0) + 35
        });
      }
    });

    return lines;
  }

  getRestaurantTables(): void {
    this.isLoading = true;
    this.waitlistService.getRestaurantTableslist(this.restaurantId).subscribe({
      next: (res) => {
        this.isLoading = false;
        const apiTables = res.data || [];

        this.tables = apiTables.map((table: tableList, index: number) => ({
          ...table,
          x: this.getDefaultX(index),
          y: this.getDefaultY(index),
          rotation: 0,
          mergeGroupId: null
        }));
      },
      error: () => {
        this.isLoading = false;
        alert('Unable to load the table');
      }
    });
  }

  reloadTableList(): void {
    this.getRestaurantTables();
  }

  setMode(mode: TableMode): void {
    if (this.activeMode === mode) {
      this.cancelMode();
      return;
    }

    this.activeMode = mode;
    this.selectedTableIds = [];
    this.selectedTable = null;
  }

  toggleEditMode(): void {
    this.activeMode = this.activeMode === 'EDIT' ? 'LIVE' : 'EDIT';
    this.selectedTableIds = [];
    this.selectedTable = null;
  }

  cancelMode(): void {
    this.activeMode = 'LIVE';
    this.selectedTableIds = [];
    this.selectedServer = '';
  }

  onTableClick(table: FloorTable): void {
    if (this.activeMode === 'MERGE') {
      this.selectForMerge(table);
      return;
    }

    if (this.activeMode === 'ASSIGN') {
      this.toggleSelected(table.id);
      return;
    }

    this.selectedTable =
      this.selectedTable?.id === table.id ? null : table;
  }

  selectForMerge(table: FloorTable): void {
    if (table.status !== 'OPEN') {
      alert('Only open tables can be merged');
      return;
    }

    if (table.mergeGroupId) {
      alert('Already merged table cannot be selected');
      return;
    }

    this.toggleSelected(table.id);
  }

  toggleSelected(tableId: number): void {
    if (this.selectedTableIds.includes(tableId)) {
      this.selectedTableIds = this.selectedTableIds.filter(id => id !== tableId);
    } else {
      this.selectedTableIds = [...this.selectedTableIds, tableId];
    }
  }

  isSelected(tableId: number): boolean {
    return this.selectedTableIds.includes(tableId);
  }

  confirmMerge(): void {
    if (this.selectedTableIds.length < 2) return;

    const groupId = 'MG-' + Date.now();

    this.tables = this.tables.map(table => {
      if (this.selectedTableIds.includes(table.id)) {
        return { ...table, mergeGroupId: groupId };
      }
      return table;
    });

    this.mergedGroups = [...this.mergedGroups, groupId];
    this.cancelMode();

    alert('Tables merged successfully');
  }

  isMerged(tableId: number): boolean {
    return this.tables.some(t => t.id === tableId && !!t.mergeGroupId);
  }

  assignServer(): void {
    this.tables = this.tables.map(table => {
      if (this.selectedTableIds.includes(table.id)) {
        return { ...table, server: this.selectedServer || 'Unassigned' };
      }
      return table;
    });

    this.cancelMode();
  }

  onDragEnd(event: CdkDragEnd, table: FloorTable): void {
    if (table.status === 'OCCUPIED') return;

    const pos = event.source.getFreeDragPosition();

    table.x = this.snap(pos.x);
    table.y = this.snap(pos.y);

    event.source.setFreeDragPosition({
      x: table.x,
      y: table.y
    });

    // Later call backend save API here
    // this.waitlistService.updateTablePosition(...)
  }

  onFixtureDragEnd(event: CdkDragEnd, fixture: FloorFixture): void {
    const pos = event.source.getFreeDragPosition();

    fixture.x = this.snap(pos.x);
    fixture.y = this.snap(pos.y);

    event.source.setFreeDragPosition({
      x: fixture.x,
      y: fixture.y
    });
  }

  snap(value: number): number {
    const grid = 10;
    return Math.round(value / grid) * grid;
  }

  rotateTable(table: FloorTable, event: MouseEvent): void {

    event.stopPropagation();

    table.rotation = ((table.rotation || 0) + 90) % 360;

  }

  changeCapacity(table: FloorTable, capacity: number, event: MouseEvent): void {
    event.stopPropagation();
    table.capacity = capacity;
  }

  getNextTableNumber(): string {
    const maxNumber = this.tables
      .map(table => {
        const match = table.tableNumber?.match(/\d+/);
        return match ? Number(match[0]) : 0;
      })
      .reduce((max, current) => Math.max(max, current), 0);

    return `T${maxNumber + 1}`;
  }

  addTable(capacity: number): void {
    const payload: addTabletoRestaurantRequest = {
      tableNumber: this.getNextTableNumber(),
      capacity: capacity
    };

    this.isLoading = true;

    this.waitlistService.addTabletoRestaurant(
      this.restaurantId,
      payload
    ).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.success) {
          const addedTable = res.data;

          this.tables.push({
            ...addedTable,
            x: 40,
            y: 40,
            rotation: 0,
            mergeGroupId: null
          });

          alert(res.message || 'Table added successfully');
        }
      },
      error: () => {
        this.isLoading = false;
        alert('Unable to add table');
      }
    });
  }

  getStatusOptions(table: FloorTable): { label: string; value: string }[] {
    switch (table.status) {
      case 'OPEN':
        return [
          { label: 'Reserve', value: 'RESERVED' },
          { label: 'Occupied', value: 'OCCUPIED' }
        ];

      case 'OCCUPIED':
        return [
          { label: 'Open', value: 'OPEN' },
          { label: 'Need Clean', value: 'DIRTY' }
        ];

      case 'RESERVED':
        return [
          { label: 'Open', value: 'OPEN' },
          { label: 'Occupied', value: 'OCCUPIED' }
        ];

      case 'DIRTY':
        return [
          { label: 'Open', value: 'OPEN' },
          { label: 'Occupied', value: 'OCCUPIED' }
        ];

      default:
        return [];
    }
  }

  changeTableStatus(table: FloorTable, status: string): void {
    this.isLoading = true;

    this.waitlistService.updateTableStatus(
      this.restaurantId,
      table.id,
      status
    ).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.success) {
          const updatedStatus = res.data?.status || status;

          this.tables = this.tables.map(t => {
            if (t.id === table.id) {
              return {
                ...t,
                status: updatedStatus
              };
            }
            return t;
          });

          this.selectedTable = null;

          alert(res.message || 'Table status updated successfully');
        }
      },
      error: () => {
        this.isLoading = false;
        alert('Unable to update table status');
      }
    });
  }


  removeTable(table: FloorTable): void {
    if (table.status === 'OCCUPIED') {
      alert('Occupied table cannot be removed');
      return;
    }

    this.tables = this.tables.filter(t => t.id !== table.id);
    this.selectedTable = null;
  }

  addFixture(type: FixtureType): void {
    this.fixtures.push({
      id: Date.now(),
      type,
      label: type === 'HOST' ? 'HOST STAND' : type,
      x: 300,
      y: 250,
      rotation: 0
    });
  }

  getChairs(capacity: number): { position: string; index: number; total: number }[] {
    const chairs: { position: string; index: number; total: number }[] = [];

    if (capacity === 2) {
      return [
        { position: 'top', index: 0, total: 1 },
        { position: 'bottom', index: 0, total: 1 }
      ];
    }

    if (capacity === 4) {
      return [
        { position: 'top', index: 0, total: 2 },
        { position: 'top', index: 1, total: 2 },
        { position: 'bottom', index: 0, total: 2 },
        { position: 'bottom', index: 1, total: 2 }
      ];
    }

    if (capacity === 6) {
      return [
        { position: 'top', index: 0, total: 3 },
        { position: 'top', index: 1, total: 3 },
        { position: 'top', index: 2, total: 3 },
        { position: 'bottom', index: 0, total: 3 },
        { position: 'bottom', index: 1, total: 3 },
        { position: 'bottom', index: 2, total: 3 }
      ];
    }

    if (capacity === 8) {
      return [
        { position: 'top', index: 0, total: 3 },
        { position: 'top', index: 1, total: 3 },
        { position: 'top', index: 2, total: 3 },

        { position: 'bottom', index: 0, total: 3 },
        { position: 'bottom', index: 1, total: 3 },
        { position: 'bottom', index: 2, total: 3 },

        { position: 'left', index: 0, total: 1 },
        { position: 'right', index: 0, total: 1 }
      ];
    }

    return [
      { position: 'top', index: 0, total: 1 },
      { position: 'bottom', index: 0, total: 1 }
    ];
  }

  rotateFixture(fixture: FloorFixture, event: MouseEvent): void {
    event.stopPropagation();
    fixture.rotation = (fixture.rotation + 90) % 360;
  }

  getDefaultX(index: number): number {
    const gap = 115;
    return 40 + (index % 10) * gap;
  }

  getDefaultY(index: number): number {
    const gap = 95;
    return 40 + Math.floor(index / 10) * gap;
  }

  trackById(_: number, table: FloorTable): number {
    return table.id;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
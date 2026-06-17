import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { tableList } from 'src/app/models/waitlist-api-guest-to-restaurant.model';
import { RestaurantTable } from 'src/app/models/waitlist-restaurant.model';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';
import { WaitlistRestaurantModalService } from 'src/app/services/waitlist-restaurant-modal.service';
import { WaitlistRestaurantService } from 'src/app/services/waitlist-restaurant.service';

@Component({
  selector: 'app-waitlist-tables',
  templateUrl: './waitlist-tables.component.html',
  styleUrls: ['./waitlist-tables.component.css']
})
export class WaitlistTablesComponent {

  tables: tableList[] = [];
  private sub = new Subscription();
  restaurantId = 1;

  get openCount(): number { return this.tables.filter(t => t.status === 'OPEN').length; }
  get seatedCount(): number { return this.tables.filter(t => t.status === 'OCCUPIED').length; }
  get reservedCount(): number { return this.tables.filter(t => t.status === 'RESERVED').length; }
  get dirtyCount(): number { return this.tables.filter(t => t.status === 'DIRTY').length; }

  constructor(private waitlistService: WaitlistApiRestaurantService, public modalService: WaitlistRestaurantModalService) {}

  ngOnInit(): void {
    this.getRestaurantTables();
  }


  getRestaurantTables(){

    this.waitlistService.getRestaurantTableslist(this.restaurantId).subscribe({
      next: (res) => {
        this.tables = res.data
      },error: () => {
        alert('Unable to load the table');
      }
    })
  }

  reloadTableList(){
this.getRestaurantTables()
  }
  ngOnDestroy(): void { this.sub.unsubscribe(); }

  trackById(_: number, t: tableList): number { return t.id; }
}

import { Component, OnInit } from '@angular/core';
import { WaitlistApiRestaurantService } from 'src/app/services/waitlist-api-restaurant.service';

@Component({
  selector: 'app-waitlist-user-hero',
  templateUrl: './waitlist-user-hero.component.html',
  styleUrls: ['./waitlist-user-hero.component.css']
})
export class WaitlistUserHeroComponent implements OnInit {
restaurantId = 1;
partiesWaiting = 0;
  waitMinutes = 0;

constructor(private waitlistApi :WaitlistApiRestaurantService){

}
ngOnInit(){
 this.getWaitlistDashboardStatus();
}

getWaitlistDashboardStatus(){
  this.waitlistApi.getwaitlistdashBoardStatus(this.restaurantId).subscribe({
    next:(res) => {
      this.partiesWaiting = res.data.totalWaiting;
      this.waitMinutes = res.data.averageWaitTime;
    },
  })
}

}

import { Component } from '@angular/core';
import { PortalOffer } from 'src/app/models/guest-portal.model';

@Component({
  selector: 'app-waitlist-user-discounts',
  templateUrl: './waitlist-user-discounts.component.html',
  styleUrls: ['./waitlist-user-discounts.component.css']
})
export class WaitlistUserDiscountsComponent {
offers: PortalOffer[] = [

    {

      id: 1,

      restaurantName: 'Trattoria Nove',

      title: '20% off pasta night',

      description:

        'Valid on selected pasta dishes.',

      discountText: '20% OFF',

      validUntil: 'Jul 31',

      imageClass: 'purple'

    },

    {

      id: 2,

      restaurantName: 'Brothers Café',

      title: '$10 off first visit',

      description:

        'Available for new members.',

      discountText: '$10 OFF',

      validUntil: 'Aug 10',

      imageClass: 'gold'

    },

    {

      id: 3,

      restaurantName: 'Kijo Sushi Bar',

      title: 'Free appetiser',

      description:

        'With orders above $40.',

      discountText: 'FREE',

      validUntil: 'Aug 15',

      imageClass: 'blue'

    }

  ];

  redeemOffer(offer: PortalOffer): void {

    alert(

      `${offer.title} redeemed successfully`

    );

  }
}

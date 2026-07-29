import {
  Component
} from '@angular/core';

import {
  PortalReward
} from 'src/app/models/guest-portal.model';

@Component({
  selector: 'app-waitlist-user-rewards',
  templateUrl: './waitlist-user-rewards.component.html',
  styleUrls: ['./waitlist-user-rewards.component.css']
})
export class WaitlistUserRewardsComponent {

  currentPoints = 850;

  rewards: PortalReward[] = [
    {
      id: 1,
      title: '$5 dining credit',
      description:
        'Use at participating restaurants.',
      pointsRequired: 500,
      available: true,
      icon: 'fa-solid fa-dollar-sign'
    },
    {
      id: 2,
      title: 'Free appetiser',
      description:
        'Choose one eligible appetiser.',
      pointsRequired: 750,
      available: true,
      icon: 'fa-solid fa-bowl-food'
    },
    {
      id: 3,
      title: '$15 dining credit',
      description:
        'Redeem on bills above $40.',
      pointsRequired: 1500,
      available: false,
      icon: 'fa-solid fa-gift'
    }
  ];

  redeemReward(
    reward: PortalReward
  ): void {
    if (
      this.currentPoints <
      reward.pointsRequired
    ) {
      alert(
        'You do not have enough points'
      );

      return;
    }

    this.currentPoints -=
      reward.pointsRequired;

    alert(
      `${reward.title} redeemed successfully`
    );
  }
}
import {
  Component
} from '@angular/core';

interface MenuRestaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  distance: string;
  deliveryTime: string;
  priceLevel: string;
  imageClass: string;
}

@Component({
  selector: 'app-waitlist-user-menu',
  templateUrl: './waitlist-user-menu.component.html',
  styleUrls: ['./waitlist-user-menu.component.css']
})
export class WaitlistUserMenuComponent {

  searchText = '';

  selectedCuisine = 'All';

  cuisines = [
    'All',
    'Breakfast',
    'Italian',
    'Steakhouse',
    'Sushi',
    'Vegetarian'
  ];

  restaurants: MenuRestaurant[] = [
    {
      id: 1,
      name: 'Brothers Café',
      cuisine: 'Breakfast',
      rating: 4.8,
      distance: '0.4 km',
      deliveryTime: '20–30 min',
      priceLevel: '$$',
      imageClass: 'menu-purple'
    },
    {
      id: 2,
      name: 'Trattoria Nove',
      cuisine: 'Italian',
      rating: 4.6,
      distance: '1.1 km',
      deliveryTime: '25–35 min',
      priceLevel: '$$$',
      imageClass: 'menu-gold'
    },
    {
      id: 3,
      name: 'The Copper Grill',
      cuisine: 'Steakhouse',
      rating: 4.9,
      distance: '2.3 km',
      deliveryTime: '30–40 min',
      priceLevel: '$$$',
      imageClass: 'menu-blue'
    },
    {
      id: 4,
      name: 'Kijo Sushi Bar',
      cuisine: 'Sushi',
      rating: 4.7,
      distance: '3 km',
      deliveryTime: '25–30 min',
      priceLevel: '$$',
      imageClass: 'menu-green'
    }
  ];

  get filteredRestaurants(): MenuRestaurant[] {
    const search =
      this.searchText
        .trim()
        .toLowerCase();

    return this.restaurants.filter(
      restaurant => {
        const matchesCuisine =
          this.selectedCuisine === 'All' ||
          restaurant.cuisine ===
          this.selectedCuisine;

        const matchesSearch =
          !search ||
          restaurant.name
            .toLowerCase()
            .includes(search) ||
          restaurant.cuisine
            .toLowerCase()
            .includes(search);

        return (
          matchesCuisine &&
          matchesSearch
        );
      }
    );
  }
}
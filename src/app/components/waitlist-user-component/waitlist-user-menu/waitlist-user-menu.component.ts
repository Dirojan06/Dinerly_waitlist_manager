import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Category, Dish } from 'src/app/models/waitlist-menu.model';

import {
  MenuService
} from 'src/app/services/menu.service';


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
  templateUrl:
    './waitlist-user-menu.component.html',
  styleUrls: [
    './waitlist-user-menu.component.css'
  ]
})
export class WaitlistUserMenuComponent
  implements OnInit, OnChanges {

  @Input()
  isActive = false;


  searchText = '';

  selectedCuisine = 'All';

  isLoadingMenu = false;

  menuErrorMessage = '';

  private menuLoaded = false;

  categories: Category[] = [];
  selectedCategoryId?: any;
  selectedCategoryName = '';
  isDirectMenuRoute = false;

  dishes: Dish[] = [];


  cuisines = [
    'All',
    'Breakfast',
    'Italian',
    'Steakhouse',
    'Sushi',
    'Vegetarian'
  ];


  restaurants:
    MenuRestaurant[] = [
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


  constructor(
    private menuService: MenuService
  ) {}


  ngOnInit(): void {

    console.log(
      'Menu component ngOnInit triggered'
    );

    this.loadMenuWhenActive();

  }


  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['isActive'] &&
      this.isActive
    ) {

      console.log(
        'Menu tab became active'
      );

      this.loadMenuWhenActive();
    }
  }


  get filteredRestaurants():
    MenuRestaurant[] {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    return this.restaurants.filter(
      restaurant => {

        const matchesCuisine =
          this.selectedCuisine ===
            'All' ||
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


  private loadMenuWhenActive(): void {

    if (!this.isActive) {
      return;
    }

    if (this.menuLoaded) {
      return;
    }

    this.getMenuMethod();
  }


  getMenuMethod(): void {

    if (this.isLoadingMenu) {
      return;
    }

    this.isLoadingMenu = true;

    this.menuErrorMessage = '';

    this.menuService
      .getCategories()
      .subscribe({
        next: response => {

          console.log(
            'Menu response:',
            response
          );
          this.categories = response;
          this.menuLoaded = true;

          this.isLoadingMenu = false;
          if (response.length > 0) {
          this.onCategorySelect(response[0].id, response[0].name);
        }

          /*
           * Map the API response here when
           * your category response structure
           * is confirmed.
           */
        },

        error: error => {

          console.error(
            'Menu API error:',
            error
          );

          this.menuLoaded = false;

          this.isLoadingMenu = false;

          this.menuErrorMessage =
            error?.error?.message ||
            'Unable to load menu.';
        }
      });
  }

  onCategorySelect(categoryId: number, categoryName: string): void {
    this.selectedCategoryId = categoryId;
    this.selectedCategoryName = categoryName;

      this.menuService.getDishesByCategory(categoryName).subscribe(res => {
        this.dishes = res;

        this.dishes = res.filter(dish => dish.status?.toLowerCase() === 'active');
      });
    

  }
  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    img.classList.remove('loading');
    img.classList.add('loaded');
  }


  refreshMenu(): void {

    this.menuLoaded = false;

    this.getMenuMethod();
  }
}
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

interface MenuItem {

  name: string;

  description: string;

  price: number;

  emoji: string;

  category: string;

}

@Component({
  selector: 'app-waitlist-user-menu',
  templateUrl: './waitlist-user-menu.component.html',
  styleUrls: ['./waitlist-user-menu.component.css']
})



export class WaitlistUserMenuComponent {
 searchText = '';

  selectedCategory = 'Appetizers';

  categories = ['Appetizers', 'Soups', 'Mains', 'Desserts', 'Beverages'];

  menuItems: MenuItem[] = [

    {

      name: 'Charred Broccoli',

      description: 'Lemon, chili crunch, pecorino',

      price: 11,

      emoji: '🥦',

      category: 'Appetizers'

    },

    {

      name: 'Crispy Calamari',

      description: 'Banana peppers, lemon aioli',

      price: 14,

      emoji: '🦐',

      category: 'Appetizers'

    },

    {

      name: 'Tomato Soup',

      description: 'Creamy tomato soup with herbs',

      price: 9,

      emoji: '🍅',

      category: 'Soups'

    },

    {

      name: 'Grilled Chicken',

      description: 'Served with vegetables and sauce',

      price: 18,

      emoji: '🍗',

      category: 'Mains'

    }

  ];

  get filteredItems(): MenuItem[] {

    return this.menuItems.filter(item =>

      item.category === this.selectedCategory &&

      item.name.toLowerCase().includes(this.searchText.toLowerCase())

    );

  }

  selectCategory(category: string): void {

    this.selectedCategory = category;

  }
}

import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

@Component({
  selector: 'app-waitlist-user-menu',
  templateUrl: './waitlist-user-menu.component.html',
  styleUrls: ['./waitlist-user-menu.component.css']
})



export class WaitlistUserMenuComponent implements OnInit{
  constructor(private sanitizer: DomSanitizer){

  }

  ngOnInit(): void {
    this.tabsIcon = this.tabs.map(tab => ({

    ...tab,

    icon: this.sanitizer.bypassSecurityTrustHtml(tab.icon)

  }));
  }



  activeTab = 'starters';
  tabsIcon : any[] = [];

  tabs = [
    {
      key: 'starters',
      label: 'Starters',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>'
    },
    {
      key: 'mains',
      label: 'Mains',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12h20M6 4v4m0 0c0 2.21 1.79 4 4 4h4c2.21 0 4-1.79 4-4"/><rect x="4" y="16" width="16" height="4" rx="2"/></svg>'
    },
    {
      key: 'desserts',
      label: 'Desserts',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 11H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2zM6 16v3M12 16v3M18 16v3"/><path d="M12 11V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v6"/></svg>'
    },
    {
      key: 'drinks',
      label: 'Drinks',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>'
    }
  ];

  

  menuItems: Record<string, MenuItem[]> = {
    starters: [
      {
        id: 1,
        name: 'Caesar Salad',
        description: 'Romaine, parmesan, house dressing',
        price: 14,
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200&h=160&fit=crop',
        category: 'starters'
      },
      {
        id: 2,
        name: 'French Onion Soup',
        description: 'Gruyère, toasted crouton',
        price: 12,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=160&fit=crop',
        category: 'starters'
      },
      {
        id: 3,
        name: 'Shrimp Cocktail',
        description: '6 jumbo shrimp, house sauce',
        price: 18,
        image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=200&h=160&fit=crop',
        category: 'starters'
      },
      {
        id: 4,
        name: 'Charcuterie Board',
        description: 'Seasonal cheeses & cured meats',
        price: 22,
        image: 'https://images.unsplash.com/photo-1542529782691-34bb2b2a02af?w=200&h=160&fit=crop',
        category: 'starters'
      }
    ],
    mains: [
      {
        id: 5,
        name: 'Grilled Salmon',
        description: 'Herb crust, lemon butter, seasonal veg',
        price: 28,
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&h=160&fit=crop',
        category: 'mains'
      },
      {
        id: 6,
        name: 'Beef Tenderloin',
        description: '8oz, garlic mash, red wine jus',
        price: 42,
        image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=200&h=160&fit=crop',
        category: 'mains'
      },
      {
        id: 7,
        name: 'Mushroom Risotto',
        description: 'Arborio, truffle oil, parmesan',
        price: 22,
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=200&h=160&fit=crop',
        category: 'mains'
      },
      {
        id: 8,
        name: 'Pan-Seared Duck',
        description: 'Cherry reduction, wilted greens',
        price: 36,
        image: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=200&h=160&fit=crop',
        category: 'mains'
      }
    ],
    desserts: [
      {
        id: 9,
        name: 'Crème Brûlée',
        description: 'Vanilla bean, caramelized sugar',
        price: 10,
        image: 'https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?w=200&h=160&fit=crop',
        category: 'desserts'
      },
      {
        id: 10,
        name: 'Chocolate Fondant',
        description: 'Dark chocolate, vanilla ice cream',
        price: 12,
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=160&fit=crop',
        category: 'desserts'
      },
      {
        id: 11,
        name: 'Lemon Tart',
        description: 'Citrus curd, meringue, fresh berries',
        price: 9,
        image: 'https://images.unsplash.com/photo-1519915028121-7d3463d5b1ff?w=200&h=160&fit=crop',
        category: 'desserts'
      },
      {
        id: 12,
        name: 'Cheese Plate',
        description: '3 selections, honey, walnuts',
        price: 16,
        image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=200&h=160&fit=crop',
        category: 'desserts'
      }
    ],
    drinks: [
      {
        id: 13,
        name: 'House Red Wine',
        description: 'Cabernet Sauvignon, full-bodied',
        price: 12,
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&h=160&fit=crop',
        category: 'drinks'
      },
      {
        id: 14,
        name: 'Craft Cocktail',
        description: "Chef's seasonal creation",
        price: 14,
        image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=200&h=160&fit=crop',
        category: 'drinks'
      },
      {
        id: 15,
        name: 'Sparkling Water',
        description: 'San Pellegrino, 750ml',
        price: 6,
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&h=160&fit=crop',
        category: 'drinks'
      },
      {
        id: 16,
        name: 'Espresso',
        description: 'Double shot, locally roasted',
        price: 4,
        image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=200&h=160&fit=crop',
        category: 'drinks'
      }
    ]
  };

  get currentItems(): MenuItem[] {
    return this.menuItems[this.activeTab] || [];
  }

  setTab(key: string): void {
    this.activeTab = key;
  }

  addToOrder(item: MenuItem): void {
    console.log('Added to order:', item.name);
    // Connect to cart service here
  }
}

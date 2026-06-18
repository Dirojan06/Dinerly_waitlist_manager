import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WaitlistUserComponentComponent } from './components/waitlist-user-component/waitlist-user-component.component';
import { WaitlistLoginComponent } from './components/waitlist-login/waitlist-login.component';
import { WaitlistActiveListComponent } from './components/waitlist-restaurant-components/waitlist-active-list/waitlist-active-list.component';
import { WaitlistHistoryComponent } from './components/waitlist-restaurant-components/waitlist-history/waitlist-history.component';
import { WaitlistNotificationComponent } from './components/waitlist-restaurant-components/waitlist-notification/waitlist-notification.component';
import { WaitlistTablesComponent } from './components/waitlist-restaurant-components/waitlist-tables/waitlist-tables.component';
import { WaitlistSettingsComponent } from './components/waitlist-restaurant-components/waitlist-settings/waitlist-settings.component';
import { WaitlistRestaurantComponentComponent } from './components/waitlist-restaurant-components/waitlist-restaurant-component.component';
import { WaitlistDashboardComponent } from './components/waitlist-restaurant-components/waitlist-dashboard/waitlist-dashboard.component';
import { WaitlistAuthGuard } from './auth-guard/waitlist-auth.guard';
import { WaitlistWaitingScreenComponent } from './components/waitlist-user-component/waitlist-waiting-screen/waitlist-waiting-screen.component';
import { WaitlistReportsComponent } from './components/waitlist-restaurant-components/waitlist-reports/waitlist-reports.component';



const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: WaitlistLoginComponent },
  { path: 'login/:role', component: WaitlistLoginComponent },
  {

    path: 'user',
    component: WaitlistUserComponentComponent
  },

  {
    path: 'user/waiting',
    component: WaitlistWaitingScreenComponent
  },

  {
    path: 'restaurant',
    component: WaitlistRestaurantComponentComponent,
    canActivate: [WaitlistAuthGuard],

    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: WaitlistDashboardComponent },
      { path: 'waitlist', component: WaitlistActiveListComponent },
      { path: 'tables', component: WaitlistTablesComponent },
      { path: 'notify', component: WaitlistNotificationComponent },
      { path: 'history', component: WaitlistHistoryComponent },
      { path: 'settings', component: WaitlistSettingsComponent },
      { path: 'reports', component: WaitlistReportsComponent }

    ]
  },

  // {

  //   path: 'admin',

  //   component: WaitlistAdminComponent,

  //   canActivate: [WaitlistAuthGuard],

  //   data: { roles: ['admin'] }

  // },

  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

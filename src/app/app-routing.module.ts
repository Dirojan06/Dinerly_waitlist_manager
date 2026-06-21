import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WaitlistUserComponentComponent } from './components/waitlist-user-component/waitlist-user-component.component';
import { WaitlistLoginComponent } from './components/waitlist-login/waitlist-login.component';
import { WaitlistActiveListComponent } from './components/waitlist-restaurant-components/waitlist-active-list/waitlist-active-list.component';
import { WaitlistNotificationComponent } from './components/waitlist-restaurant-components/waitlist-notification/waitlist-notification.component';
import { WaitlistTablesComponent } from './components/waitlist-restaurant-components/waitlist-tables/waitlist-tables.component';
import { WaitlistRestaurantComponentComponent } from './components/waitlist-restaurant-components/waitlist-restaurant-component.component';
import { WaitlistDashboardComponent } from './components/waitlist-restaurant-components/waitlist-dashboard/waitlist-dashboard.component';
import { WaitlistAuthGuard } from './auth-guard/waitlist-auth.guard';
import { WaitlistWaitingScreenComponent } from './components/waitlist-user-component/waitlist-waiting-screen/waitlist-waiting-screen.component';
import { WaitlistAdminComponent } from './components/waitlist-admin/waitlist-admin.component';
import { AdminReportsComponent } from './components/waitlist-admin/admin-reports/admin-reports.component';
import { AdminHistoryComponent } from './components/waitlist-admin/admin-history/admin-history.component';
import { AdminSettingsComponent } from './components/waitlist-admin/admin-settings/admin-settings.component';



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
    ]
  },
  {
    path: 'admin',
    component: WaitlistAdminComponent,
    canActivate: [WaitlistAuthGuard],
    children: [
      { path: '', redirectTo: 'reports', pathMatch: 'full' },
      { path: 'history', component: AdminHistoryComponent },
      { path: 'settings', component: AdminSettingsComponent },
      { path: 'reports', component: AdminReportsComponent }

    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

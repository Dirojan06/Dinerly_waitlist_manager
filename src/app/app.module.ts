import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WaitlistLoginComponent } from './components/waitlist-login/waitlist-login.component';
import { WaitlistNavbarComponent } from './components/waitlist-navbar/waitlist-navbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WaitlistUserComponentComponent } from './components/waitlist-user-component/waitlist-user-component.component';
import { WaitlistUserHeroComponent } from './components/waitlist-user-component/waitlist-user-hero/waitlist-user-hero.component';
import { WaitlistUserMenuComponent } from './components/waitlist-user-component/waitlist-user-menu/waitlist-user-menu.component';
import { WaitlistUserBannerComponent } from './components/waitlist-user-component/waitlist-user-banner/waitlist-user-banner.component';
import { WaitlistUserSidebarComponent } from './components/waitlist-user-component/waitlist-user-sidebar/waitlist-user-sidebar.component';
import { WaitlistModalComponent } from './components/waitlist-modal/waitlist-modal.component';
import { WaitlistWaitingScreenComponent } from './components/waitlist-user-component/waitlist-waiting-screen/waitlist-waiting-screen.component';
import { WaitlistTablesComponent } from './components/waitlist-restaurant-components/waitlist-tables/waitlist-tables.component';
import { WaitlistHistoryComponent } from './components/waitlist-restaurant-components/waitlist-history/waitlist-history.component';
import { WaitlistActiveListComponent } from './components/waitlist-restaurant-components/waitlist-active-list/waitlist-active-list.component';
import { WaitlistSettingsComponent } from './components/waitlist-restaurant-components/waitlist-settings/waitlist-settings.component';
import { WaitlistNotificationComponent } from './components/waitlist-restaurant-components/waitlist-notification/waitlist-notification.component';
import { WaitlistRestaurantComponentComponent } from './components/waitlist-restaurant-components/waitlist-restaurant-component.component';
import { CommonModule } from '@angular/common';
import { WaitlistRestaurantModalComponent } from './components/waitlist-restaurant-components/waitlist-restaurant-modal/waitlist-restaurant-modal.component';
import { WaitlistDashboardComponent } from './components/waitlist-restaurant-components/waitlist-dashboard/waitlist-dashboard.component';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatStepperModule } from "@angular/material/stepper";



@NgModule({
  declarations: [
    AppComponent,
    WaitlistLoginComponent,
    WaitlistNavbarComponent,
    WaitlistUserComponentComponent,
    WaitlistUserHeroComponent,
    WaitlistUserMenuComponent,
    WaitlistUserBannerComponent,
    WaitlistUserSidebarComponent,
    WaitlistModalComponent,
    WaitlistWaitingScreenComponent,
    WaitlistTablesComponent,
    WaitlistHistoryComponent,
    WaitlistActiveListComponent,
    WaitlistSettingsComponent,
    WaitlistNotificationComponent,
    WaitlistRestaurantComponentComponent,
    WaitlistRestaurantModalComponent,
    WaitlistDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    MatStepperModule
],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

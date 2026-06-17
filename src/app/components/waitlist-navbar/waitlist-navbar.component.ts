import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser } from 'src/app/models/waitlist-auth.model';
import {  WaitlistAuthService } from 'src/app/services/waitlist-auth.service';

@Component({
  selector: 'app-waitlist-navbar',
  templateUrl: './waitlist-navbar.component.html',
  styleUrls: ['./waitlist-navbar.component.css']
})
export class WaitlistNavbarComponent implements OnInit {

  user: AuthUser | null = null;

  constructor(private auth: WaitlistAuthService) {

  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  signOut(): void {
    this.auth.signOut();
  }

}

import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { CommonService } from './service/common.service';

import { Amplify } from 'aws-amplify';
import { AuthenticatorService } from '@aws-amplify/ui-angular';

import awsExports from '../aws-exports';
import {  NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

  layoutMode = localStorage.getItem('layoutMode') ? localStorage.getItem('layoutMode') : 'overlay';

  layoutColor = 'light';

  darkMenu = false;

  isRTL = localStorage.getItem('selectedLanguage') == 'arUAE' ? true : false;

  inputStyle = 'Outlined';

  ripple = true;
  direc = localStorage.getItem('selectedLanguage') == 'arUAE' ? 'rtl' : 'ltr';
  mySubscription:any;
  constructor(private router: Router,private primengConfig: PrimeNGConfig, public commonService: CommonService, public authenticator: AuthenticatorService) {
    Amplify.configure(awsExports);
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.mySubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
         // Trick the Router into believing it's last link wasn't previously loaded
         this.router.navigated = false;
      }
    }); 
  }

  ngOnInit() {

    this.primengConfig.ripple = true;
  }

  ngOnDestroy(){
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }

}

import { Component } from '@angular/core';
import { faDollar, faLanguage, fas } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import gql from 'graphql-tag';
import { print } from 'graphql';
import awsmobile from 'src/aws-exports';
import { Auth } from 'aws-amplify';
import { AppComponent } from './app.component';
import { AppMainComponent } from './app.main.component';
import { CommonService } from './service/common.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  styleUrls: ['./app.topbar.component.scss']
})
export class AppTopBarComponent {
  // faTh = faTh;
  // faCog = faCog;
  // faEnvelope = faEnvelope;
  // faBell = faBell;
  falanguage = faLanguage;
  fadollar = faDollar;
  selectedCurrencyValue: string = "INR";
  selectedLanguageValue: string = localStorage.getItem('selectedLanguage') ? localStorage.getItem('selectedLanguage') : "enUS";
  isRTL = localStorage.getItem('selectedLanguage') == 'arUAE' ? true : false;

  constructor(public translateService: TranslateService, public appMain: AppMainComponent, public commonService: CommonService, public app: AppComponent, public library: FaIconLibrary) {
    library.addIconPacks(fas);

  }

  ngOnInit() {
    this.getUserDetails();
  }

  async getUserDetails() {
    this.commonService.userDetails = (await Auth.currentUserInfo());
    localStorage.setItem('nodeCode', this.commonService.userDetails.attributes['custom:primarynodecode'])
    localStorage.setItem('clientCode', this.commonService.userDetails.attributes['custom:creatednode'])
    this.commonService.getAppList();
    this.commonService.getFunctionalitiesForUser();
    this.commonService.getProfileDetails();
  }

  changeLanguage(language) {

    this.selectedLanguageValue = language
    this.commonService.useLanguage(language);
    this.commonService.selectedLanguage = language;
    localStorage.setItem('selectedLanguage', language);
    if (language == 'arUAE') {
      this.app.direc = 'rtl';
      this.app.isRTL = true;
      this.isRTL = true;
    } else {
      this.app.direc = 'ltr';
      this.app.isRTL = false;
      this.isRTL = false;
    }
  }

  changeCurrency(currency) {
    this.commonService.useCurrency(currency);
  }

  signOut() {
    Auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
  }

  redirectToApp(url) {
    window.location.href = url;
  }
  bindAppName(appname) {
    return "topbar.app_drawer.app_name_list." + appname;
  }


}

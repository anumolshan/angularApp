import { Component, OnInit } from '@angular/core';
import { faAddressCard, faArrowsUpDown, faCalculator, faCalendarDays, faCogs, faEnvelopeOpenText, faEnvelopesBulk, faFile, faFileInvoice, faMoneyBill1, faPercent, faPrint, faSitemap, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { Auth, DataStore } from 'aws-amplify';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { CommonService } from 'src/app/service/common.service';
import { Client } from 'src/models';
import axios from 'axios';
// import graphql from 'graphql-tag';
import gql from 'graphql-tag';
import { print } from 'graphql';
import awsmobile from 'src/aws-exports';
import { Router } from '@angular/router';
import { Functionalities } from 'src/app/enum/functionality';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  addressCard = faAddressCard
  faCogs = faCogs
  faEnvelopeOpenText = faEnvelopeOpenText
  faUserShield = faUserShield
  faSitemap = faSitemap
  faCalendarDays = faCalendarDays
  faMoneyBill1 = faMoneyBill1
  faPercent = faPercent
  faCalculator = faCalculator
  faEnvelopesBulk = faEnvelopesBulk
  faPrint = faPrint
  faFileInvoice = faFileInvoice
  faFile = faFile
  faArrowsUpDown = faArrowsUpDown
  constructor(public commonService: CommonService, public translateService: TranslateService, private breadcrumbService: AppBreadcrumbService,public router: Router) {
    this.breadcrumbService.setItems([
      { label: 'settings.pages.settingpage.breadcrumbs.breadcrumb1',routerLink: '/settings'}

    ]);
    this.translateService.setDefaultLang(this.commonService.selectedLanguage);
  }

  ngOnInit(): void {

    this.commonService.accessList = Functionalities;
    if (this.commonService.checkItemExist(Functionalities.ViewSettings)) {
      this.getClient();
    } else {
      this.router.navigate(['/']);
    }
  }
  ngDoCheck() {

    if (this.commonService.selectedLanguage != this.commonService.lastSelectedLanguage) {
      this.commonService.lastSelectedLanguage = this.commonService.selectedLanguage;
      this.translateService.use(this.commonService.selectedLanguage);
    } else {
      this.translateService.setDefaultLang(this.commonService.selectedLanguage);
    }

  }
  async getClient() {

    const listClients = gql`
            query MyQuery {
              listClients {
                items {
                  id
                  name
                  description
                  profile
                  updatedAt
                }
              }
            }
          `

    try {
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      const graphqlData = await axios({
        url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger,
        method: 'post',
        headers: {
          'Authorization': "Bearer " + token
        },
        data: {
          query: print(listClients),
        }
      });
      const body = {
        graphqlData: graphqlData.data
      }

    } catch (err) {
      console.log('error posting to appsync: ', err);

    }

  }

  redirectToApp(page) { 
    
     let url;
      if(page == 'profile'){
        url =  this.commonService.adminAppDetails['NavigationURL'] + '#/adminstration/profile';
      } else {
        url =  this.commonService.adminAppDetails['NavigationURL'] + '#/users/user-list';
      }
      window.location.href = url
   
  }

}

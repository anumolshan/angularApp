import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Auth, Storage } from 'aws-amplify';
import { PrimeNGConfig } from 'primeng/api';
import awsmobile from 'src/aws-exports';
import axios from 'axios';
import gql from 'graphql-tag';
import { print } from 'graphql';
import { Router } from '@angular/router';
import { faCog, faChartLine, faChartColumn, faScaleBalanced, faReceipt, faFileInvoiceDollar, faFileLines, faBook, faHandHoldingDollar, faHome, faUpDown, faArrowDown, faArrowsUpDown, faArrowsUpDownLeftRight, faSort, faUniversity, faScroll, faCalculator, faFileContract } from '@fortawesome/free-solid-svg-icons';
import { Functionalities } from '../enum/functionality';
import { App } from '../enum/app';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  selectedCurrencyLabel: string = 'Indian Rupees Result';
  selectedCurrency: string = 'INR';
  selectedLanguage: string = localStorage.getItem('selectedLanguage') ? localStorage.getItem('selectedLanguage') : 'enUS';
  lastSelectedLanguage: string = '';
  profileDetails: any = {};
  userDetails: any;
  appDetails: any;
  appList: any[] = [];
  functionalitylist: any[] = [];
  model: any[] = [];
  adminAppDetails: any = {};
  showMenu: boolean;
  currentPagePrivilegeList: any[] = [];
  accessList: any = {};
  permissionList: any = {};
  isLoad: boolean;
  isUpadated: boolean;
  lastLocation: string;
  tempFunList: any [] = [];
  tempPrvList: any [] = [];
  isAppSearched:boolean = false;
  constructor(public translateService: TranslateService, private config: PrimeNGConfig, public datepipe: DatePipe, public router: Router) {
    translateService.setDefaultLang(this.selectedLanguage);
    const templist = localStorage.getItem('funList')
    this.tempFunList = JSON.parse(templist);
  }

  useLanguage(language: string): void {
    this.translateService.use(language);
    this.translateService.get('primeng').subscribe((res) => {
      this.config.setTranslation(res);
    });
  }
  useCurrency(currency: string): void {
    if (currency == 'USD') {
      this.selectedCurrencyLabel = 'United States Currency Result';
    } else {
      this.selectedCurrencyLabel = 'Indian Rupees Result';
    }
    this.selectedCurrency = currency;
  }
  setDateFormat(dateaVlue) {
    const formatedDate = new Date(dateaVlue);
    const latest_date = this.datepipe.transform(formatedDate, 'dd/MM/yyyy hh:mm a');
    return latest_date;
  }

  async getFileName(url) {

    const imgPathSplitUp = url.split('?');
    const fileName = imgPathSplitUp[0].substring(imgPathSplitUp[0].lastIndexOf('/') + 1, );
    const newFilename = decodeURIComponent(fileName);
    const signedURL = await Storage.get(newFilename, {
      expires: 700
    });
    return signedURL;
  }

  async getProfileDetails() {
    
    const SaaSApiGraphQL = gql`

    query SaaSApiGraphQL($Id: String!) {
     getClientByid(SK: $Id, PK: $Id) {
       PK
       SK
       Name
       Description
       GSI1PK
       LSI1
       SearchName
       Type
       Address
       BaseCurrency
       City
       CompanyRegId
       Country
       NavigationURL
       TaxNo
       PhoneNo
       Email
       NavigationURL
       Layout
       Theme
       FormDataId
       LogoSquare
       Logo
     }
     listDynamicFormData(filter: {nodeCode: {eq: $Id}}) {
       items {
         formData,
         id,
         formId
       }
     }
   },`

    try {
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      const graphqlData = await axios({
        url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_administration_permission,
        method: 'post',
        headers: {
          Authorization: 'Bearer ' + token
        },
        data: {
          query: print(SaaSApiGraphQL),
          variables: {
            Id: localStorage.getItem('clientCode')
          }

        }
      });
      const body = {
        graphqlData: graphqlData.data
      }
      this.profileDetails = graphqlData.data.data.getClientByid;

      if (this.profileDetails.Logo) {
        this.profileDetails.Logo = await this.getFileName(this.profileDetails.Logo);
      }
      if (this.profileDetails.LogoSquare) {
        this.profileDetails.LogoSquare = await this.getFileName(this.profileDetails.LogoSquare);
      }
    } catch (err) {
      console.log('error posting to appsync: ', err);

    }
  }

  async getAppList() {   
    if (this.isAppSearched == false) {
      this.isLoad = true;
    this.appList = [];
    const listApps = gql`
    query MyQuery($clientId: String!, $userId: String!) {
      getAppsForUser(clientId: $clientId, userId: $userId) {
        data {
          PK
          Name
          Icon
          NavigationURL
          Description
          Priority
        }
      }
    }`

    try {
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      const graphqlData = await axios({
        url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_administration_permission,
        method: 'post',
        headers: {
          Authorization: 'Bearer ' + token
        },
        data: {
          query: print(listApps),
          variables: {
            clientId: this.userDetails?this.userDetails.attributes["custom:creatednode"]: localStorage.getItem('clientCode'),
            userId: this.userDetails? "USR_" + this.userDetails.attributes.sub: "USR_" + localStorage.getItem('userId')
          }
        }
      });

      this.isAppSearched = true;
      if (graphqlData.data.data.getAppsForUser != null && graphqlData.data.data.getAppsForUser.data.length > 0) {
        await this.sortAppByPriority(graphqlData.data.data.getAppsForUser.data);
        this.appDetails = this.appList.find((result) => { return result.Name == 'Ledger' });
        this.adminAppDetails = this.appList.find((result) => { return result.Name == 'Administration' });
        const anotherAppsList = this.appList.filter((result) => { return result.Name != 'Ledger' });
        if (this.appDetails) {
          this.showMenu = true;
          // this.getFunctionalitiesForUser();
        } else {
          this.showMenu = false;
          this.isLoad = false;
          if (anotherAppsList){
            localStorage.clear();
            sessionStorage.clear();
            anotherAppsList.find((app) => {
              if (app.Priority) {
                // this.redirectToApp(app.NavigationURL);
              }
            })
          } else {
          
            this.isLoad = false;
            this.router.navigate(['/']);
          }
        }
      } else {
        this.showMenu = false;
        this.isLoad = false;
        this.router.navigate(['/']);
      }

    } catch (err) {
      this.isLoad = false;
      console.log('error posting to appsync: ', err);

    }
    }
   
  }
  async getFunctionalitiesForUser() {
    const baseModel = [
      {
        PK: Functionalities.ViewDashboard, label: 'side_menu.dashboard', icon: faHome, routerLink: ['/']
      },
      {
        label: 'side_menu.reciept_payment', icon: faUniversity, routerLink: ['/banking'],
        items: [
          {
            PK: Functionalities.ViewMasterReceipt, label: 'side_menu.reciept', icon: faReceipt, routerLink: ['/banking/view-receipt']
          },
          {
            PK: Functionalities.ViewMasterPayment, label: 'side_menu.payment', icon: faFileInvoiceDollar, routerLink: ['/banking/payment']
          },
          {
            PK: Functionalities.ViewMasterContraVouchers, label: 'side_menu.contra_vouchers', icon: faSort, routerLink: ['/banking/view-contra-vouchers']
          }
        ]
      },
      {
        label: 'side_menu.journals', icon: faScroll, routerLink: ['/journals'],
        items: [
          {
            PK: Functionalities.ViewJournalsVouchers, label: 'side_menu.journal_vouchers', icon: faFileLines, routerLink: ['/journals/view-journal'],
          }
        ]
      },
      {
        label: 'side_menu.accounting_reports', icon: faFileContract, routerLink: ['/accounting'],
        items: [
          {
            PK: Functionalities.ViewDayBook, label: 'side_menu.day_book', icon: faBook, routerLink: ['/accounting/day-book'],
          },
          {
            PK: Functionalities.ViewAccountLedger, label: 'side_menu.account_ledger', icon: faChartColumn, routerLink: ['/accounting/account-ledger'],
          }
        ]
      },
      {
        label: 'side_menu.financial_reports', icon: faChartLine, routerLink: ['/finance'],
        items: [  
          {
            PK: Functionalities.ViewTrialBalance, label: 'side_menu.trial_balance', icon: faScaleBalanced, routerLink: ['/finance/trial-balance'],
          },
          {
            PK: Functionalities.ViewProfitLoss, label: 'side_menu.profit_loss_statement', icon: faHandHoldingDollar, routerLink: ['/finance/profit-loss'],
          },
          {
            PK: Functionalities.ViewBalanceSheet, label: 'side_menu.balance_sheet', icon: faChartLine, routerLink: ['/finance/balance-sheet'],
          }
        ]
      }

    ];
    this.functionalitylist = [];
    this.tempFunList = [];
    this.userDetails = (await Auth.currentUserInfo());
    const SaaSApiGraphQL = gql`
    query MyQuery($clientId: String!, $userId: String!, $appId: String!) {
        getFunctionalitiesForUser(appId: $appId, clientId: $clientId, userId: $userId) {
          status
          error
          data {
            PK
            Name
          }
        }
      }
     `
    try {
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      const graphqlData = await axios({
        url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_administration_permission,
        method: 'post',
        headers: {
          Authorization: 'Bearer ' + token
        },
        data: {
          query: print(SaaSApiGraphQL),
          variables: {
            clientId: this.userDetails?this.userDetails.attributes["custom:creatednode"]: localStorage.getItem('clientCode'),
            userId: this.userDetails? "USR_" + this.userDetails.attributes.sub: "USR_" + localStorage.getItem('userId'),
            appId: App.ledgerAppId
          }

        }
      });
      if (graphqlData.data.data.getFunctionalitiesForUser && graphqlData.data.data.getFunctionalitiesForUser.error == null) {
        this.functionalitylist = graphqlData.data.data.getFunctionalitiesForUser.data;
        localStorage.setItem('funList', JSON.stringify(this.functionalitylist));
        this.isUpadated = true;
        const activeGroups = [];

        const dash = {
          PK: 'FUN_2A3Rb38ggi0UbpxiOhKdLJhuA5z', label: 'side_menu.dashboard', icon: faHome, routerLink: ['/']
        };
        if (this.checkItemExist('FUN_2A3Rb38ggi0UbpxiOhKdLJhuA5z')) {
          activeGroups.push(dash);
        }

        for (const group of baseModel) {
          const tempFunList = [];
          if (group.items && group.items.length > 0) {
            for (const item of group.items) {
              if (this.checkItemExist(item.PK)) {
                tempFunList.push(item);
              }
            }
          }
          group.items = tempFunList;
          if (group.items.length > 0) {
            activeGroups.push(group);
          }
        }

        const settings = {
          PK: Functionalities.ViewSettings, label: 'side_menu.settings', icon: faCog, routerLink: ['/settings']
        }
        if (this.checkItemExist(Functionalities.ViewSettings)) {
          activeGroups.push(settings);
        }



        this.model = [
          {
            label: 'topbar.ledger',
            items: activeGroups
          },
        ];
        setTimeout(() => {
          this.model = [...this.model];
        }, 100);
        this.isLoad = false;

      }
      this.isLoad = false;


    } catch (err) {
      this.isLoad = false;

      console.log('error posting to appsync: ', err);
    }
  }
  checkItemExist(PK) {
    let status = false;
    if(this.functionalitylist && this.functionalitylist.length > 0){
      for (const row of this.functionalitylist) {
        if (row.PK == PK) {
          status = true;
          break;
        }
      }
    } else {
      for (const row of this.tempFunList) {
        if (row.PK == PK) {
          status = true;
          break;
        }
      }
    }
    return status;
  }
  async sortAppByPriority(list) {
    this.appList = [];
    const sortAppByPriority = list.sort((a, b) => a.Priority - b.Priority);
    this.appList = sortAppByPriority;
  }
  redirectToApp(url) {
    window.location.href = url;
  }

  async getPrivilegesForUser(payLoad) {
    this.currentPagePrivilegeList = [];
    const SaaSApiGraphQL = gql`

    query MyQuery($clientId: String!, $userId: String!, $funId: String) {
      getPrivilegesForUser(clientId: $clientId, funId: $funId, userId: $userId) {
        error
        status
        data {
          PK
          Name
        }
      }
    }
    `

    try {
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      const graphqlData = await axios({
        url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_administration_permission,
        method: 'post',
        headers: {
          Authorization: 'Bearer ' + token
        },
        data: {
          query: print(SaaSApiGraphQL),
          variables: payLoad
        }
      });
      if (graphqlData.data.data.getPrivilegesForUser.data != null && graphqlData.data.data.getPrivilegesForUser.error == null){
             this.currentPagePrivilegeList = graphqlData.data.data.getPrivilegesForUser.data;
             localStorage.setItem('prvList', JSON.stringify(this.currentPagePrivilegeList));

          }
    } catch (err) {
      console.log('error posting to appsync: ', err);

    }
  }


  checkPrvItemExist(PK) {
    let status = false;
    if(this.currentPagePrivilegeList && this.currentPagePrivilegeList.length > 0){
      for (const row of this.currentPagePrivilegeList) {
        if (row.PK == PK) {
          status = true;
          break;
        }
      }
    } else {
      for (const row of this.tempPrvList) {
        if (row.PK == PK) {
          status = true;
          break;
        }
      }
    }
    return status;

  }
  async apiCallBack(endpoint, query, payLoad){
    try {
      const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      const graphqlData = await axios({
        url: endpoint,
        method: 'post',
        headers: {
          Authorization: 'Bearer ' + token
        },
        data: {
          query: print(query),
          variables: payLoad
        }
      });
  
      const returnResponse = {
        graphqlData: graphqlData.data
      };
  
      return returnResponse;
  
    } catch (err) {
  
      console.log('error posting to appsync: ', err);
      return null;
    }
    }
}
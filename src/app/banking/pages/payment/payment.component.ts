import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import gql from 'graphql-tag';
import { MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { CommonService } from 'src/app/service/common.service';
import awsmobile from 'src/aws-exports';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  currentDate = new Date();
  paymentStatus: any[];
  filteredpayStatusList: any = [];
  selectedPaymentStatus: any[];
  selectedBranch: any = {};
  filteredBranchList: any = [];
  branchList : any[] = [];
  demoData: any = {};
  newDynamic: any = {};
  accountList: any[];
  filteredAccountList: any = [];
  selectedAccount: any[];
  currencyList: any[];
  filteredCurrencyList: any = [];
  selectedCurrency: any[];
  slectedCashBank: any = {};
  cashBankList: any[] = [];
  filteredcashBankList: any[] = [];
  isSpinner: boolean = false;
  selectdTabType: string = 'cash';
  constructor(public commonService: CommonService, public translateService: TranslateService, private breadcrumbService: AppBreadcrumbService, public messageService: MessageService
  ) {
    this.breadcrumbService.setItems([
      { label: 'side_menu.reciept_payment' },
      { label: 'side_menu.payment' }
    ]);
    this.translateService.setDefaultLang(this.commonService.selectedLanguage);
  }

  ngOnInit(): void {
    this.getClientsByRootClientid();
    this.getCashorBankAccounts();
    this.demoData = [{}];
    this.accountList = [
      { Name: 'Elif Bank' },
      { Name: 'Canara Bank' }
    ];
    this.paymentStatus = [
      { name: 'Pending' },
      { name: 'Progress' },
      { name: 'Completed' }
    ];
    this.currencyList = [
      { currency: 'INR' },
      { currency: 'PKR' }
    ]
  }
  ngDoCheck() {

    if (this.commonService.selectedLanguage !== this.commonService.lastSelectedLanguage) {
      this.commonService.lastSelectedLanguage = this.commonService.selectedLanguage;
      this.translateService.use(this.commonService.selectedLanguage);
    } else {
      this.translateService.setDefaultLang(this.commonService.selectedLanguage);
    }

  }
  filterPaymtStatus(event) {
    const filtered: any[] = [];
    const query = event.query;

    for (let i = 0; i < this.paymentStatus.length; i++) {
      const data = this.paymentStatus[i];
      if (data.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(data);
      }
    }

    this.filteredpayStatusList = filtered;

  }
  addRow() {
    this.newDynamic = {};
    this.demoData.push(this.newDynamic);
  }
  filteredAccount(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.accountList.length; i++) {
      const data = this.accountList[i];
      if (data.Name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(data);
      }
    }
    this.filteredAccountList = filtered;
  }
  deleteRow(data) {

    this.demoData.splice(this.demoData.indexOf(data), 1);

  }
  filteredCurrency(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.currencyList.length; i++) {
      const data = this.currencyList[i];
      if (data.currency.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(data);
      }
    }
    this.filteredCurrencyList = filtered;
  }

  filterCashBank(event) {
    const filtered: any[] = [];
    const query = event.query;

    for (let i = 0; i < this.cashBankList.length; i++) {
      const data = this.cashBankList[i];
      if (data.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(data);
      }
    }

    this.filteredcashBankList = filtered;
  }
  async getClientsByRootClientid() {
    this.isSpinner = true;

    const SaaSApiGraphQL = gql`
    query SaaSApiGraphQL( $nextToken: String!, $limit: Int!,$GSI1PK: String!) {
      getClientsByRootClientid(nextToken: $nextToken, limit: $limit, GSI1PK: $GSI1PK ) {
        items {
          PK
          SK
          Name
          Description
          GSI1PK
          LSI1
          SearchName
          Type
          BaseCurrency
        }
        nextToken
      }
    }
 `
    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_administration_permission;
    const payLoad = {
      GSI1PK: 'ROOTCLI_2A16BbviR2gxp86o2llHwxBktn4',
      limit: 20,
      nextToken: ''
    };
    try {
      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);

      if (returnResponse.graphqlData.data != null && returnResponse.graphqlData.data.getClientsByRootClientid != null) {
        this.branchList = returnResponse.graphqlData.data.getClientsByRootClientid.items;
        this.selectedBranch = this.branchList[0];
      }
      this.isSpinner = false;


    } catch (err) {
      this.isSpinner = false;

      console.log('error posting to appsync: ', err);
    }
  }
  async getCashorBankAccounts() {
    this.isSpinner = true;
    let SaaSApiGraphQL;
    this.cashBankList = [];
    let payLoad;
    if (this.selectdTabType == 'cash') {
      SaaSApiGraphQL = gql`
     query MyQuery($limit: Int!, $offSet: Int!) {
      getCashAccounts(limit: $limit, offSet: $offSet) {
        body {
          no
          name
        }
      }
    }
    
   `

      payLoad = {
        "limit": 500,
        "offSet": 0
      };
    } else {
      SaaSApiGraphQL = gql`
      query MyQuery($limit: Int!, $offSet: Int!) {
        getBankAccounts(limit: $limit, offSet: $offSet) {
          body {
            no
            name
          }
        }
      }
      
   `

      payLoad = {
        "limit": 500,
        "offSet": 0
      };
    }
    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger;

    try {
      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);

      if (this.selectdTabType == 'cash') {
        if (returnResponse.graphqlData.data != null && returnResponse.graphqlData.data.getCashAccounts != null) {
          this.cashBankList = returnResponse.graphqlData.data.getCashAccounts.body;
        }
      } else {
        if (returnResponse.graphqlData.data != null && returnResponse.graphqlData.data.getBankAccounts != null) {
          this.cashBankList = returnResponse.graphqlData.data.getBankAccounts.body;
        }
      }
      this.isSpinner = false;


    } catch (err) {
      this.isSpinner = false;

      console.log('error posting to appsync: ', err);
    }
  }
  selectedTab(event) {
    this.slectedCashBank = ""
    if (event.index == 0) {
      this.selectdTabType = 'cash';
      this.getCashorBankAccounts();
    } else {
      this.selectdTabType = 'bank';
      this.getCashorBankAccounts();

    }

  }
  filteredBranch(event) {
    const filtered: any[] = [];
    const query = event.query;

    for (let i = 0; i < this.branchList.length; i++) {
      const data = this.branchList[i];
      if (data.Name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(data);
      }
    }

    this.filteredBranchList = filtered;

  }
}

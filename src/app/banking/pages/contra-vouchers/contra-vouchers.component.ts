import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import gql from 'graphql-tag';
import { MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { CommonService } from 'src/app/service/common.service';
import { HelperView } from 'src/app/shared/helper.view';
import awsmobile from 'src/aws-exports';

@Component({
  selector: 'app-contra-vouchers',
  templateUrl: './contra-vouchers.component.html',
  styleUrls: ['./contra-vouchers.component.scss']
})
export class ContraVouchersComponent implements OnInit {
  currentDate = new Date();
  selectedBranch: any= {};
  filteredBranchList: any = [];
  branchList: any[];
  demoData: any = {};
  newDynamic: any = {};
  accountList: any[];
  filteredAccountList: any = [];
  selectedAccount: any[];
  currencyList : any[];
  filteredCurrencyList : any =[];
  selectedCurrency : any[];

  journalVoucherData: any = {};
  totalDebitValue: number = 0;
  totalCreditValue: number = 0;
  toAllocateValue: number = 0;

  filteredItems: any[] = [];
  branchBaseCurrency: string = '';
  journalId: string = '';
  referenceId: string = '';




  contraVouchersList: any[];
  selectedCountry: any;
  sales: any[];
  clonedProducts: { [s: string]: any; } = {};
  allAppList: any[] = [];
  jvId: string = '';
  showJvPage: boolean = false;
  type: string = '';
  isEditJournal = false;
  entriesHistorty: any = {};
  isSpinner: boolean = false;

  constructor(public commonService: CommonService, public translateService: TranslateService, private breadcrumbService: AppBreadcrumbService, public messageService: MessageService
  ) {
    this.breadcrumbService.setItems([
      { label: 'side_menu.reciept_payment' },
      { label: 'settings.pages.paymt_recipt_contra.add_contra_vouch' }
    ]);
    this.translateService.setDefaultLang(this.commonService.selectedLanguage);
  }

  ngOnInit(): void {
    // this.demoData = [{}];
    this.getClientsByRootClientid();
    this.getContraVouchers();
    this.journalVoucherData.entries = [{}, {}]
    this.journalVoucherData.date = this.currentDate;

    this.accountList = [
      { Name: 'Elif Bank' },
      { Name: 'Canara Bank' }
    ];
    // this.branchList = [
    //   { Name: 'NCT HQ' }
    // ];
    this.currencyList = [
      {currency : 'INR'},
      {currency : 'PKR'}
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

  addRow(i, type, currentRow) {
    const enttryArray = this.journalVoucherData.entries;


    if (enttryArray.length > 0) {
      // tslint:disable-next-line: max-line-length
      if ((enttryArray[enttryArray.length - 1].base_credit != undefined || enttryArray[enttryArray.length - 1].base_debit != undefined) && (enttryArray[enttryArray.length - 1].base_credit != null || enttryArray[enttryArray.length - 1].base_debit != null)) {
        if (i != 0 && (type == 'debit' && (this.journalVoucherData.entries[i].base_debit))) {
          this.journalVoucherData.entries.push(this.newDynamic);
          this.newDynamic = {};
        } else if (i != 0 && (type == 'credit' && (this.journalVoucherData.entries[i].base_credit))) {
          this.journalVoucherData.entries.push(this.newDynamic);
          this.newDynamic = {};
        } else if (i != 0 && (type == 'rate' && (this.journalVoucherData.entries[i].rateOfExchange))) {
          this.journalVoucherData.entries.push(this.newDynamic);
          this.newDynamic = {};
        } else if (type == 'button') {
          this.journalVoucherData.entries.push(this.newDynamic);
          this.newDynamic = {};
        } else if (i == 0 && (type == 'debit' && (this.journalVoucherData.entries[i].base_debit)) || (type == 'credit' && (this.journalVoucherData.entries[i].base_credit))) {
          this.journalVoucherData.entries.push(this.newDynamic);
          this.newDynamic = {};
        }
      }
    } else {
      this.journalVoucherData.entries.push(this.newDynamic);
      this.newDynamic = {};
    }


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

  deleteRow(index, deleteEntry) {

    if (deleteEntry.account !== undefined) {
      this.journalVoucherData.entries.splice(index, 1);
      // const entryObj: Entries = new Entries();
      // entryObj.amount = deleteEntry.base_debit ? deleteEntry.base_debit : deleteEntry.base_credit;
      // entryObj.ledgerNo = deleteEntry.account.no;
      // entryObj.lineNarration = deleteEntry.lineNarration;
      // entryObj.xactTypeCode = deleteEntry.base_debit ? 'Dr' : 'Cr';

      // if (deleteEntry.currency !== this.branchBaseCurrency && (deleteEntry.foreign_credit || deleteEntry.foreign_debit)) {
      //   entryObj.foreignCurrencyAmount = deleteEntry.foreign_credit ? deleteEntry.foreign_credit : deleteEntry.foreign_debit;
      //   entryObj.rateOfExchange = deleteEntry.rateOfExchange;
      // }

      // this.entriesHistorty.deletedEntries.push(entryObj);
      this.totalCalculate();
      return true;
    } else {
      this.journalVoucherData.entries.splice(index, 1);
      this.totalCalculate();
      return true;
    }
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
  selectAccount(event, i, transaction) {


    if (i == 0 || (i != 0 && (this.journalVoucherData.entries[i - 1].base_debit != null && this.journalVoucherData.entries[i - 1].base_debit != 0 || this.journalVoucherData.entries[i - 1].base_credit != null && this.journalVoucherData.entries[i - 1].base_credit != 0))) {
      this.journalVoucherData.entries[i].currency = transaction.account.currencyCode;
      this.journalVoucherData.entries[i].accountName = transaction.account.name;

      if (transaction.lastSelectedCurrency !== this.journalVoucherData.entries[i].currency) {
        this.journalVoucherData.entries[i].foreign_debit = null;
        this.journalVoucherData.entries[i].foreign_credit = null;
        this.journalVoucherData.entries[i].rateOfExchange = null;
        this.journalVoucherData.entries[i].base_credit = null;
        this.journalVoucherData.entries[i].base_debit = null;
        this.journalVoucherData.entries[i].lastSelectedCurrency = transaction.account.currencyCode;
      }

      this.totalCalculate();
    }

    else {

      this.journalVoucherData.entries[i].currency = null;
      this.journalVoucherData.entries[i].account = null;
      this.journalVoucherData.entries[i].accountName = null;
      this.journalVoucherData.entries[i].lineNarration = '';
      this.journalVoucherData.entries[i].foreign_debit = null;
      this.journalVoucherData.entries[i].foreign_credit = null;
      this.journalVoucherData.entries[i].rateOfExchange = null;
      this.journalVoucherData.entries[i].base_credit = null;
      this.journalVoucherData.entries[i].base_debit = null;
      const fieldId = 'account' + (i - 1);
      setTimeout(() => document.getElementById(fieldId).focus(), 100);
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: 'Above journal entry is not valid' });
    }


  }
  totalCalculate() {

    this.totalCreditValue = 0;
    this.totalDebitValue = 0;
    this.toAllocateValue = 0;

    this.journalVoucherData.entries.map(ele => {
      if (ele.base_credit != null) {
        this.totalCreditValue += ele.base_credit;
      }
      if (ele.base_debit != null) {
        this.totalDebitValue += ele.base_debit;
      }
    });
    this.toAllocateValue = Math.abs(this.totalCreditValue - this.totalDebitValue);

  }
  filterItems(event) {

    const filtered: any[] = [];
    const query = event.query;

    for (let i = 0; i < this.contraVouchersList.length; i++) {
      const item = this.contraVouchersList[i];

      if (item.AccCodeName.toLowerCase().includes(query.toLowerCase())) {
        filtered.push(item);
      }
    }

    this.filteredItems = filtered;
  }
  setFocus(i, current, type) {

    const fieldId = type + i;
    if (type == 'foreign_debit') {
      current.foreign_debit = null;
    } else if (type == 'foreign_credit') {
      current.foreign_credit = null;
    } else if (type == 'rateOfExchange') {
      current.rateOfExchange = null;
    }
    else if (type == 'base_debit') {
      current.base_debit = null;
    }
    else if (type == 'base_credit') {
      current.base_credit = null;
    }
    setTimeout(() => document.getElementById(fieldId).focus(), 100);
  }
  focusOutLineNarration(i, transaction, type) {


    if (transaction.account && transaction.account.currencyCode) {

      if (type == 'lineNarration' && (transaction.account.currencyCode == this.branchBaseCurrency)) {
        const fieldId = 'baseDebit' + i;
        transaction.isValidBaseDebit = false;
        setTimeout(() => document.getElementById(fieldId).focus(), 100);
      }

      else if (type == 'baseDebit' && (transaction.base_debit != null) && (transaction.base_debit != 0)) {
        const fieldId = 'account' + (i + 1);
        transaction.isValidBaseDebit = true;
        setTimeout(() => document.getElementById(fieldId).focus(), 100);
      }
      else if (type == 'baseCredit' && ((transaction.base_debit != null) && (transaction.base_debit != 0))) {
        const fieldId = 'account' + (i + 1);
        setTimeout(() => document.getElementById(fieldId).focus(), 100);
      }
      else if (type == 'baseCredit' && ((transaction.base_credit != null) && (transaction.base_credit != 0))) {
        const fieldId = 'account' + (i + 1);
        transaction.isValidBaseCredit = true;
        setTimeout(() => document.getElementById(fieldId).focus(), 100);
      } else if (type == 'rate' && ((transaction.foreign_credit != null) || (transaction.foreign_debit != null)) && transaction.rateOfExchange != null) {
        const fieldId = 'account' + (i + 1);
        if (transaction.isValidForeignDebit) {
          transaction.isValidBaseDebit = true;
          setTimeout(() => document.getElementById(fieldId).focus(), 100);
        } else {
          transaction.isValidBaseCredit = true;
          setTimeout(() => document.getElementById(fieldId).focus(), 100);
        }
      }
      else if (type == 'fd' && (transaction.foreign_debit != null)) {
        transaction.isValidForeignDebit = true;
        const fieldId = 'rate' + (i);
        setTimeout(() => document.getElementById(fieldId).focus(), 100);
      }
      else if (type == 'fc' && (transaction.foreign_credit != null)) {
        transaction.isValidForeignCredit = true;
      }
    }
  }
  rateCalculate(event, transaction) {


    if (transaction.foreign_credit != null && transaction.foreign_credit != '') {
      transaction.base_credit = transaction.foreign_credit * transaction.rateOfExchange;
      transaction.base_debit = null;
    } else if (transaction.foreign_debit != null && transaction.foreign_debit != '') {
      transaction.base_debit = transaction.foreign_debit * transaction.rateOfExchange;
      transaction.base_credit = null;
    }
    this.totalCalculate();

  }
  async getContraVouchers() {
    this.contraVouchersList = [];
    const SaaSApiGraphQL = gql`
    query MyQuery($limit: Int!, $offSet: Int!) {
      getContraVouchersLedgerAccounts(limit: $limit, offSet: $offSet) {
        body {
          no
          name
          currencyCode
        }
      }
    }
    
      
  `
    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger;
    const payLoad = {
      "limit": 500,
      "offSet": 0
    };
    try {
      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
      let tempcontraVouchersList = [];
      if (returnResponse.graphqlData.data.getContraVouchersLedgerAccounts.body != null) {
        tempcontraVouchersList = returnResponse.graphqlData.data.getContraVouchersLedgerAccounts.body;

        tempcontraVouchersList.forEach(element => {
          element.AccCodeName = element.name + " - " + element.no.toString() + " - " + element.Code;
          this.contraVouchersList.push(element);
        });
      }



    } catch (err) {
      this.isSpinner = false;

      console.log('error posting to appsync: ', err);
    }
  }
  

  branchOnSelect(event) {

    this.branchBaseCurrency = event.BaseCurrency;
    this.referenceId = event.PK;
    // this.updateSequenceGenerator(event);
  }
  validationForCreateJournal() {

    if (!HelperView.checkStringEmptyOrNull(this.journalVoucherData.date)) {
      setTimeout(() => document.getElementById('date').focus());
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: 'Date is required' });
      return false;
    }

    if (this.journalVoucherData.entries.length >= 2 && (this.journalVoucherData.entries[0].base_debit == null && this.journalVoucherData.entries[0].base_credit == null)) {
      if (this.selectedBranch == '' || this.selectedBranch.PK == undefined) {
        this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: 'Branch is required' });
        return false;
      }
      if (this.journalVoucherData.entries[this.journalVoucherData.entries.length - 1].base_credit == null && this.journalVoucherData.entries[this.journalVoucherData.entries.length - 1].base_debit == null) {
        this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: 'Journal entry is invalid' });
        return false;
      }
      //  if(((this.journalVoucherData.entries[this.journalVoucherData.entries.length - 1].foreign_debit !=  null) || (this.journalVoucherData.entries[this.journalVoucherData.entries.length - 1].foreign_credit != null)) && (this.journalVoucherData.entries[this.journalVoucherData.entries.length - 1].rate == null)){
      //   this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: 'Rate is empty' });
      //   return false;
      // }
      if ((this.journalVoucherData.entries[0].base_debit == null && this.journalVoucherData.entries[0].base_credit == null)) {
        this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: 'row is empty' });
        return false;
      }
    }

    return true;
  }
  async getClientsByRootClientid() {

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
  limit: 10,
  nextToken: ''
};
    try {
      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);

      if (returnResponse.graphqlData.data != null && returnResponse.graphqlData.data.getClientsByRootClientid != null) {
        this.branchList = returnResponse.graphqlData.data.getClientsByRootClientid.items;
        this.selectedBranch = this.branchList[0];
        if (this.journalId == undefined) {
          this.branchOnSelect(this.branchList[0]);
          this.selectedBranch = this.branchList[0];
        }
      }


    } catch (err) {
      this.isSpinner = false;
      console.log('error posting to appsync: ', err);
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { CountryService } from 'src/app/demo/service/countryservice';
import { CommonService } from 'src/app/service/common.service';
import { SettingsService } from 'src/app/settings/service/settings.service';
import { Journal } from '../../modal/journal';
import gql from 'graphql-tag';
import awsmobile from 'src/aws-exports';


import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JournalEntry } from '../../modal/jouvnal-entry';
import { Entries } from '../../modal/entries';
import { CurrencyPipe, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperView } from 'src/app/shared/helper.view';
import { Functionalities } from 'src/app/enum/functionality';

@Component({
  selector: 'app-create-journal-voucher',
  templateUrl: './create-journal-voucher.component.html',
  styleUrls: ['./create-journal-voucher.component.scss']


})
export class CreateJournalVoucherComponent implements OnInit {
  accountsList: any[];
  selectedCountry: any;
  sales: any[];
  newDynamic: any = {};
  clonedProducts: { [s: string]: any; } = {};
  totalDebitValue: number = 0;
  totalCreditValue: number = 0;
  toAllocateValue: number = 0;
  journalVoucherData: any = {};
  branchList: any[] = [];
  allAppList: any[] = [];
  filteredBranchList: any = [];
  filteredAccountList: any = [];
  isSpinner: boolean = false;
  currentDate = new Date();
  selectedBranch: any = {};
  branchBaseCurrency: string = '';
  jvId: string = '';
  journalId: string = '';
  referenceId: string = '';
  showJvPage: boolean = false;
  type: string = '';
  isEditJournal = false;
  filteredItems: any[] = [];
  entriesHistorty: any = {};
  constructor(public commonService: CommonService, private countryService: CountryService, public messageService: MessageService, public translateService: TranslateService, private breadcrumbService: AppBreadcrumbService, public service: SettingsService, private router: Router,
    private confirmationService: ConfirmationService, private route: ActivatedRoute, private location: Location, private currencyPipe: CurrencyPipe) {
    this.route.queryParams.subscribe(params => {
      this.journalId = params.jvId;
      this.type = params.type;
    });
    this.breadcrumbService.setItems([
      { label: 'settings.pages.journal_voucher.breadcrumbs.breadcrumb1', routerLink: '/journals/view-journal' },
      { label: this.type == 'edit' ? 'settings.pages.journal_voucher.breadcrumbs.breadcrumb3' : this.type == 'view' ? 'settings.pages.journal_voucher.breadcrumbs.breadcrumb4' : 'settings.pages.journal_voucher.breadcrumbs.breadcrumb2', routerLink: '/journals/create-journal' }
    ]);
    this.translateService.setDefaultLang(this.commonService.selectedLanguage);
  }

  ngOnInit(): void {
    // this.entriesHistorty.deletedEntries = [];
    // this.entriesHistorty.newEntries = [];
    // this.entriesHistorty.entries = [];
    this.getClientsByRootClientid();

    this.getAllAccounts();

    this.commonService.accessList = Functionalities;
    if (this.commonService.checkItemExist(Functionalities.AddJournalVoucher) || this.commonService.checkItemExist(Functionalities.ViewJournalsVouchers) || this.commonService.checkItemExist(Functionalities.EditJournalVoucher)) {
      if (this.journalId) {
        this.fetchJvDetailsById();
      } else {
        this.showJvPage = true;
        this.journalVoucherData.entries = [{}, {}]
        this.journalVoucherData.date = this.currentDate;
        const fieldId = 'account' + 0;
        setTimeout(() => document.getElementById(fieldId).focus(), 100);
      }
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

  onRowEditInit(journal: Journal) {
    this.clonedProducts[journal.id] = { ...journal };
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


  branchOnSelect(event) {

    this.branchBaseCurrency = event.BaseCurrency;
    this.referenceId = event.PK;
    // this.updateSequenceGenerator(event);
  }
  branchOnEnter() {
    setTimeout(() => document.getElementById('date').focus(), 100);
  }
  exportPdf(value) {
    const pipe = new DatePipe('en-US');
    const date = pipe.transform(this.journalVoucherData.date, 'dd-MMM-yyyy');
    this.journalVoucherData.entries.forEach(element => {
      element.foreign_debit = this.currencyFormat(element.foreign_debit);
      element.foreign_credit = this.currencyFormat(element.foreign_credit);
      element.base_debit = this.currencyFormat(element.base_debit);
      element.base_credit = this.currencyFormat(element.base_credit);
    });
    const titles = [
      { title: 'Voucher  Number'+' : '+this.journalId },
      { title: 'Branch Name'+' : '+this.selectedBranch.Name },
      { title: 'Date'+' : '+date  }

    ];
    // const narration = [
    //   { title: 'Narration', colon: ':', dataKey: this.journalVoucherData.narration }

    // ];
    

    const columns = [
      { title: 'Account', dataKey: 'accountName' },
      { title: 'Description', dataKey: 'lineNarration' },
      { title: 'Currency', dataKey: 'currency' },
      { title: 'FC Debit', dataKey: 'foreign_debit' },
      { title: 'FC Credit', dataKey: 'foreign_credit' },
      { title: 'Rate', dataKey: 'rateOfExchange' },
      { title: 'BC Debit', dataKey: 'base_debit' },
      { title: 'BC Credit', dataKey: 'base_credit' }


    ];
    const doc = new jsPDF();
    autoTable(doc, {
      theme: 'grid',
      head: titles,
      headStyles: {
        fillColor: '#125386',
        fontSize: 10
      }
    })
   
   

    autoTable(doc, {
      theme: 'grid',
      columnStyles: { foreigncurrency: { cellWidth: 'auto' }, foreign_debit: { halign :'right' } , foreign_credit: { halign :'right' }, base_debit: { halign :'right' },base_credit: { halign :'right' }},
      columns,
      body: this.journalVoucherData.entries,
      headStyles: {
        fillColor: '#125386',
        fontSize: 10,
      },
      foot: [
        [{ content: 'Total :' + this.currencyPipe.transform(this.totalDebitValue, this.branchBaseCurrency) + 'Dr' + ' | ' + this.currencyPipe.transform(this.totalCreditValue, this.branchBaseCurrency, true) + 'Cr', colSpan: 8, styles: { halign: 'right',fontSize: 10 } }],

      ],
    })

   

    autoTable(doc, {
      theme: 'grid',    
      headStyles: { fontSize: 10 ,  fillColor: '#125386'},
      bodyStyles: { fontSize: 10 },      

      head:  [['Narration']],
      body: [[this.journalVoucherData.narration]],          

    });


    if (value == 'export') {
      doc.save('Journal.pdf' + this.journalVoucherData.date)
    }
    else {
      doc.autoPrint();
      doc.output('dataurlnewwindow');
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

  clear() {

    this.selectedBranch = {};
    this.journalVoucherData = {};
    this.journalVoucherData.entries = [{}, {}];
    this.totalCreditValue = null;
    this.totalDebitValue = null;
    this.toAllocateValue = null;
    this.branchBaseCurrency = '';
    this.totalCreditValue = 0;
    this.totalDebitValue = 0;
    this.toAllocateValue = 0;
    setTimeout(() => document.getElementById('branch').focus(), 3000);

    document.getElementById('branch').focus();
    // if (this.type === 'edit') {
      this.router.navigate(['/journals/create-journal']);
    // }

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

  filterBranch(event) {
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

//   async getAllAccounts() {

//     this.accountsList = [];
//     const SaaSApiGraphQL = gql`
//     query SaaSApiGraphQL($limit: Int!, $offSet: Int!) {
//       getAllLedgers(limit: $limit, offSet: $offSet) {
//         statusCode
//         body {
//           name
//           no
//           description
//           currencyCode
//           accountTypeCode
//         }
//      }
//     }`

//     const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger;
//  const payLoad = {
//   limit: 500,
//   offSet: 0
// };

//     try {
//       let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
//       let tempAccountList;

//       if (returnResponse.graphqlData.data && returnResponse.graphqlData.data.getAllLedgers != null) {
//         tempAccountList = returnResponse.graphqlData.data.getAllLedgers.body;

//         tempAccountList.forEach(element => {
//           element.AccCodeName = element.name+" - "+element.no.toString();
//           this.accountsList.push(element);
//         });
          
//       }
      

//     } catch (err) {
//       this.isSpinner = false;
//       console.log('error posting to appsync: ', err);
//     }

//   }

async getAllAccounts() {
  this.accountsList = [];
  const SaaSApiGraphQL = gql`
  query MyQuery($limit: Int!, $offSet: Int!) {
    getAllActiveAccountsAndLedgers(limit: $limit, offSet: $offSet) {
      body {
        name
        no
        currencyCode
        Code
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
    let tempAccountList = [];
    if (returnResponse.graphqlData.data.getAllActiveAccountsAndLedgers.body != null) {
     tempAccountList = returnResponse.graphqlData.data.getAllActiveAccountsAndLedgers.body;     

      tempAccountList.forEach(element => {
        element.AccCodeName = element.name+" - "+element.no.toString() +" - "+ element.Code;
        this.accountsList.push(element);
      });
    }
    


  } catch (err) {
    this.isSpinner = false;

    console.log('error posting to appsync: ', err);
  }
}
  async updateSequenceGenerator(event) {

    const SaaSApiGraphQL = gql`
    mutation updateSequenceGenerator ($input: UpdateSequenceGeneratorInput!) {
      updateSequenceGenerator (input: $input) {
          PK
          SK
          SequenceNumber
      }
  }
 `

 const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_sequence_generator;
 const payLoad = {
  input: {
    PK: event.PK,
    SK: 'Ledger_JV'
  }
};

    try {
      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);

      if (returnResponse.graphqlData.data.updateSequenceGenerator) {
        this.jvId = returnResponse.graphqlData.data.updateSequenceGenerator;
      }

    } catch (err) {
      this.isSpinner = false;
      console.log('error posting to appsync: ', err);
    }

  }
  submitJournalVoucher() {
    if (this.totalDebitValue == this.totalCreditValue && this.totalCreditValue > 0) {
      if (this.validationForCreateJournal()) {
       
        // let creditCount = 0;
        const pipe = new DatePipe('en-US');
        const date = pipe.transform(this.journalVoucherData.date, 'yyyy-MM-dd');
        const jvObject: JournalEntry = new JournalEntry();
        jvObject.date = date;
        if (this.type == 'edit') {
          jvObject.id = Number(this.journalId);
        }
        jvObject.reference = this.journalVoucherData.reference != undefined ? this.journalVoucherData.reference : '';;
        jvObject.branch = this.referenceId;
        jvObject.narration = this.journalVoucherData.narration != undefined ? this.journalVoucherData.narration : '';
        jvObject.entries = [];
        for (const transObj of this.journalVoucherData.entries) {
          if (transObj.account && transObj.account.no) {

            const entryObj: Entries = new Entries();
            entryObj.amount = transObj.base_debit ? transObj.base_debit : transObj.base_credit;
            entryObj.ledgerNo = transObj.account.no;
            entryObj.lineNarration = transObj.lineNarration;
            entryObj.xactTypeCode = transObj.base_debit ? 'Dr' : 'Cr';

            if (transObj.currency != this.branchBaseCurrency && (transObj.foreign_credit || transObj.foreign_debit)) {
              entryObj.foreignCurrencyAmount = transObj.foreign_credit ? transObj.foreign_credit : transObj.foreign_debit;
              entryObj.rateOfExchange = transObj.rateOfExchange;
            }

            // if(entryObj.xactTypeCode == 'Dr'){
            //   debitCount += 1;
            // } else{
            //   creditCount += 1;
            // }

            jvObject.entries.push(entryObj);
          }
        }
        if (this.checkEntries()) {
          this.saveJournal(jvObject);
        } else {
          this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: 'Journal entry is invalid' });
        }
        //  if((debitCount > 1) && (creditCount > 1)){
        //        this.messageService.add({ severity: 'warn', summary: 'warn', detail: "Debit and Credit entries both cannot be more than one rows!" });


        //  }else{
        //   this.saveJournal(jvObject)
        //  }
      }
    } else {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: 'Journal entry is invalid' });

    }


  }

  async saveJournal(body) {

    this.isSpinner = true;
    const SaaSApiGraphQL = gql`
    mutation MyMutation($id: Int, $reference: String, $narration: String!, $date: String!, $branch: String!, $entries: [JVEntry]!) {
      addLedgerTransaction(input: {id: $id, reference: $reference, narration: $narration, date: $date, branch: $branch, entries: $entries}) {
        statusCode
        body{
            id
        }
      }
    }
    `
    try {
   
      const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger;
      const payLoad = body;

      const returnResponse = await this.commonService.apiCallBack(endPoint,SaaSApiGraphQL,payLoad);     

      if (returnResponse.graphqlData.data != null && returnResponse.graphqlData.data.errors == null) {

        if (returnResponse.graphqlData.data.addLedgerTransaction.body.id != null) {
          if (this.type == 'edit') {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Journal Updated successfully' });
          } else {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Journal Added successfully' });
          }
          this.journalId = returnResponse.graphqlData.data.addLedgerTransaction.body.id;
  
          setTimeout(() => {
            this.confirmDialogForSaveJournal()
          }, 1000);
        }else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'journal updation failed' });
        }

      } else {

        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'journal creation failed' });

      }
      this.isSpinner = false;

    } catch (err) {
      this.isSpinner = false;
      console.log('error posting to appsync: ', err);
    }
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


  confirmDialogForSaveJournal() {

    this.confirmationService.confirm({
      message: 'Do you want to print voucher' + ' ' + this.journalId,
      header: this.translateService.instant('Confirm'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.exportPdf('downlod');
        setTimeout(() => {
          this.clear();
        }, 500);
      },
      reject: () => {
        // if (this.type != 'edit') {
          // this.selectedBranch = {};
          // this.journalVoucherData = {};
          // this.journalVoucherData.entries = [{}, {}]
          // this.totalCreditValue = null;
          // this.totalDebitValue = null;
          // this.toAllocateValue = null;
          // this.branchBaseCurrency = '';
          // this.totalCreditValue = 0;
          // this.totalDebitValue = 0;
          // this.toAllocateValue = 0;
          this.clear();
        // } else {
        //   this.location.back();
        // }

      }
    });
  }

  async fetchJvDetailsById() {
    this.isSpinner = true;
    const SaaSApiGraphQL = gql`
   query MyQuery($Id: String!) {
  getJournalVoucherById(Id: $Id) {
    statusCode
    body {
      id
      reference
      transactedOn
      narration
      branch
      entries {
        transactionId
        ledgerNo
        amount
        xactTypeCode
        foreignCurrencyAmount
        rateOfExchange
        lineNarration
      }
    }
  }
}
 `
 const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger;
 const payLoad = {
  Id: this.journalId
};
    try {
      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);

      if (returnResponse.graphqlData.data && returnResponse.graphqlData.data.getJournalVoucherById.statusCode != null) {

        this.fillDetails(returnResponse.graphqlData.data.getJournalVoucherById.body);
      }

    } catch (err) {
      this.isSpinner = false;
      console.log('error posting to appsync: ', err);
    }
  }
  fillDetails(jvObject) {

    
    

    this.journalVoucherData.entries = [];

    this.journalVoucherData.date = new Date(jvObject[0].transactedOn);
    this.journalVoucherData.voucher = jvObject[0].id;

    const branchObj = this.branchList.find((data) => {
      if (data.PK == jvObject[0].branch) {
        return data;
      }
    });
    if (branchObj) {
      this.branchOnSelect(branchObj);
      this.selectedBranch = branchObj;
    }

    this.journalVoucherData.narration = jvObject[0].narration;
    this.journalVoucherData.reference = jvObject[0].reference;
    // this.entriesHistorty.entries = jvObject[0].entries;

    jvObject[0].entries.forEach(entry => {

      const newEntryObj: any = {};
      const accObj = this.accountsList.find((data) => {
        if (data.no == entry.ledgerNo) {
          return data;
        }
      });
      
      if (this.accountsList && this.accountsList.length > 0) {
       
        newEntryObj.account = accObj;
      newEntryObj.accountName = accObj.name;
      newEntryObj.currency = accObj.currencyCode;
      newEntryObj.lastSelectedCurrency = accObj.currencyCode;
      newEntryObj.transactionId = entry.transactionId;
      newEntryObj.lineNarration = entry.lineNarration;
      newEntryObj.foreign_debit = entry.xactTypeCode == 'Dr' && entry.foreignCurrencyAmount ? Number(entry.foreignCurrencyAmount) : null;
      newEntryObj.foreign_credit = entry.xactTypeCode == 'Cr' && entry.foreignCurrencyAmount ? Number(entry.foreignCurrencyAmount) : null;
      newEntryObj.rateOfExchange = entry.rateOfExchange ? entry.rateOfExchange : null;
      newEntryObj.base_credit = entry.xactTypeCode == 'Cr' ? Number(entry.amount) : null;
      newEntryObj.base_debit = entry.xactTypeCode == 'Dr' ? Number(entry.amount) : null;

      newEntryObj.isValidBaseCredit = true;
      newEntryObj.isValidBaseDebit = true;
      newEntryObj.isValidForeignCredit = true;
      newEntryObj.isValidForeignDebit = true;
      this.journalVoucherData.entries.push(newEntryObj);
      

      }
      
    });
    this.totalCalculate();
    this.showJvPage = true;
    this.isSpinner = false;
    if (this.type == 'view') {
      this.isEditJournal = false;
    } else {
      this.isEditJournal = true;
    }

  }

  validationForNewRow() {
    if (((this.journalVoucherData.entries[this.journalVoucherData.entries.length - 1].foreign_debit != null) || (this.journalVoucherData.entries[this.journalVoucherData.entries.length - 1].foreign_credit != null)) && (this.journalVoucherData.entries[this.journalVoucherData.entries.length - 1].rate == null)) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: 'Rate is empty' });
      return false;
    }
    return true;
  }

  checkEntries() {
    let status = false;

    this.journalVoucherData.entries.filter((result) => {
      if (result.account) {

        // if (!result.transactionId) {
        //   const entryObj: Entries = new Entries();
        //   entryObj.amount = result.base_debit ? result.base_debit : result.base_credit;
        //   entryObj.ledgerNo = result.account.no;
        //   entryObj.lineNarration = result.lineNarration;
        //   entryObj.xactTypeCode = result.base_debit ? 'Dr' : 'Cr';
        //   if (result.currency !== this.branchBaseCurrency && (result.foreign_credit || result.foreign_debit)) {
        //     entryObj.foreignCurrencyAmount = result.foreign_credit ? result.foreign_credit : result.foreign_debit;
        //     entryObj.rateOfExchange = result.rateOfExchange;
        //   }
        //   this.entriesHistorty.newEntries.push(entryObj);
        // }

        if ((result.base_debit == 0 || result.base_debit == null) && (result.base_credit == 0 || result.base_credit == null)) {
          status = false;
        } else {
          status = true;
        }
      } else {
        status = true;
      }
    });

    return status;
  }
  filterItems(event) {

    const filtered: any[] = [];
    const query = event.query;

    for (let i = 0; i < this.accountsList.length; i++) {
      const item = this.accountsList[i];
      
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
  calendarFocusOut() {
    if (this.journalVoucherData.date) {
      const fieldId = 'account' + (0);
      setTimeout(() => document.getElementById(fieldId).focus(), 100);
    }
  }
  currencyFormat(amount) {
    const amountValue = this.currencyPipe.transform(amount, this.branchBaseCurrency, '', '', 'en-US');
    return amountValue;
  }
}

import { CurrencyPipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { CountryService } from 'src/app/demo/service/countryservice';
import { CommonService } from 'src/app/service/common.service';
import { SettingsService } from 'src/app/settings/service/settings.service';
import axios from 'axios';
import gql from 'graphql-tag';
import { print } from 'graphql';
import awsmobile from 'src/aws-exports';
import { Auth } from 'aws-amplify';
import { viewStatement } from '../../view-modal/viewLedgerStatement';
import { viewLedgerEntries } from '../../view-modal/viewStatementEntries';
import { DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';



@Component({
  selector: 'app-view-account-ledger',
  templateUrl: './view-account-ledger.component.html',
  styleUrls: ['./view-account-ledger.component.scss']
})
export class ViewAccountLedgerComponent implements OnInit {
  accountsList: any[];
  isSpinner: boolean = false;
  sales: any[];
  currentDate = new Date();
  ledgerStatementData: viewStatement;
  fromDate: string = "";
  toDate: string = "";
  ledgerAccounts: any = {};
  buttonEnable: boolean = false;
  account: string = "";
  currency: string = "";
  lastBalance: number = 0;
  lastBalanceFC: number = 0;
  accountNumber: number;
  reportType: any[];
  report: any = {};

  isSearched: boolean = false;
  colRowSpan: number = 1;
  foreignDebitTotal: number = 0;
  foreignCreditTotal: number = 0;
  baseDebitTotal: number = 0;
  baseCreditTotal: number = 0;
  totalRecords:number = 0;
  pageinationData: any = {};
  accountNumberShow: any;



  constructor(public commonService: CommonService, private countryService: CountryService, public messageService: MessageService, public translateService: TranslateService, private breadcrumbService: AppBreadcrumbService, public service: SettingsService, private router: Router,
    private confirmationService: ConfirmationService, private route: ActivatedRoute, private location: Location, private currencyPipe: CurrencyPipe) {
    this.breadcrumbService.setItems([
      { label: 'settings.pages.account_ledger.breadcrumbs.breadcrumb1' },
      { label: 'settings.pages.account_ledger.breadcrumbs.breadcrumb2' }
    ]);
    this.translateService.setDefaultLang(this.commonService.selectedLanguage);
  }

  ngOnInit(): void {
    this.accountsList = [];

    this.getAllAccounts();
    this.clearTotal();

  }
  ngDoCheck() {

    if (this.commonService.selectedLanguage != this.commonService.lastSelectedLanguage) {
      this.commonService.lastSelectedLanguage = this.commonService.selectedLanguage;
      this.translateService.use(this.commonService.selectedLanguage);

    } else {
      this.translateService.setDefaultLang(this.commonService.selectedLanguage);
    }

  }
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
      let tempAccountList
      if (returnResponse.graphqlData.data.getAllActiveAccountsAndLedgers.body != null) {
       tempAccountList = returnResponse.graphqlData.data.getAllActiveAccountsAndLedgers.body;
        tempAccountList.forEach(element => {
          element.name = element.name+" - "+element.no.toString() +" - "+ element.Code;
          this.accountsList.push(element);
        });
        
      }
      


    } catch (err) {
      this.isSpinner = false;
      console.log('error posting to appsync: ', err);
    }

  }

  async getLedgerAccountStatements() {
    
    this.totalRecords = 0;
    this.colRowSpan = 2;
    const pipe = new DatePipe('en-US');
    const from  = pipe.transform(this.fromDate, "YYYY-MM-dd");
    const to  = pipe.transform(this.toDate, "YYYY-MM-dd");

    this.isSpinner = true;
    const SaaSApiGraphQL = gql`
    query MyQuery($to: String!, $from: String!, $account: Int!,$limit: Int!, $offSet: Int!) {
      getLedgerAccountStatements(from: $from, to: $to, account: $account, limit: $limit, offSet: $offSet) {
        body {
          ledgerNo
          fromDate
          toDate
          openingBalanceLC
          openingBalanceFC
          openingTypeCode
          closingBalanceLC
          closingBalanceFC
          closingTypeCode
          entries {
            date
            transactionId
            lineNarration
            amount
            xactTypeCode
            foreignCurrencyAmount
            rateOfExchange
          }
          count
        }
      }
    }
       
 `
    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger;
    const payLoad = {
      from: from,
      to: to,
      account: this.accountNumber,
      limit: this.pageinationData ! = null ?this.pageinationData.rows:50,
      offSet: this.pageinationData ! = null ?this.pageinationData.first:0,
    };

    try {

      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);


      if (returnResponse.graphqlData.data !== null && returnResponse.graphqlData.data.errors == null) {
        const tempLedgerStatement = returnResponse.graphqlData.data.getLedgerAccountStatements.body;
        this.totalRecords = tempLedgerStatement.count > 0 ? tempLedgerStatement.count + 1: 1 ;

        let accountObject: viewStatement = new viewStatement();
        accountObject.ledgerNo = tempLedgerStatement.ledgerNo;
        accountObject.fromDate = this.convertDateFormart(tempLedgerStatement.fromDate);              
        accountObject.toDate = this.convertDateFormart(tempLedgerStatement.toDate);
        accountObject.openingBalance = tempLedgerStatement.openingBalanceLC;
        accountObject.openingBalanceFc = tempLedgerStatement.openingBalanceFC;
        accountObject.openingTypeCode = tempLedgerStatement.openingTypeCode;
        accountObject.closingBalanceLC = tempLedgerStatement.closingBalanceLC;
        accountObject.closingBalanceFC = tempLedgerStatement.closingBalanceFC;
        accountObject.closingTypeCode = tempLedgerStatement.closingTypeCode;


        let openingRowObject: viewLedgerEntries = new viewLedgerEntries();

        openingRowObject.date = this.convertDateFormart(accountObject.fromDate);  // date
        openingRowObject.transactionId = null;  // transaction id
        openingRowObject.lineNarration = "Opening Balance"; // line narration
        openingRowObject.amount = accountObject.openingBalance != 0 ?accountObject.openingBalance: null; // debit and credit based on xactTypeCode in UI
        openingRowObject.xactTypeCode = accountObject.openingTypeCode; // not shown in UI
        openingRowObject.foreignCurrencyAmount = accountObject.openingBalanceFc;
        openingRowObject.rateOfExchange = "";
        openingRowObject.balance = accountObject.openingBalance;

        tempLedgerStatement.entries.unshift(openingRowObject)


        if (tempLedgerStatement.entries.length > 1) {
          tempLedgerStatement.entries.forEach((entry, index) => {
            let entriesObject: viewLedgerEntries = new viewLedgerEntries();
            entriesObject.date = this.convertDateFormart(entry.date);
            entriesObject.transactionId = entry.transactionId;
            entriesObject.lineNarration = entry.lineNarration;
            entriesObject.amount = Number(entry.amount);
            entriesObject.xactTypeCode = entry.xactTypeCode;
            entriesObject.foreignCurrencyAmount = entry.foreignCurrencyAmount;
            entriesObject.rateOfExchange = entry.rateOfExchange;


            // entriesObject.balance = entry.xactTypeCode == 'Dr'? (accountObject.openingBalance - entriesObject.amount) : (accountObject.openingBalance + entriesObject.amount) ;
            this.lastBalance = this.calculateBalance(index, entriesObject, tempLedgerStatement.openingBalanceLC, accountObject.openingTypeCode, 'bc');
            entriesObject.balance = this.lastBalance;
            this.lastBalanceFC = this.calculateBalance(index, entriesObject, tempLedgerStatement.openingBalanceFC, accountObject.openingTypeCode, 'fc');
            entriesObject.foreignBalance = this.lastBalanceFC
            accountObject.entries.push(entriesObject)

          });
        } else {
          accountObject.entries.push(openingRowObject)

        }


        this.ledgerStatementData = accountObject;
        
        
        this.totalCalculateForFooter(this.ledgerStatementData.entries)

        this.isSearched = true;
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Technical error please contact admin' });

      }

      this.isSpinner = false;

    } catch (err) {
      this.isSpinner = false;
      console.log('error posting to appsync: ', err);
    }

  }
  accountOnChange(event) {

    let isClear = true;
    if (this.isSearched == true) {
      this.confirmationService.confirm({
        message: "Do you want to change ?",
        header: "Alert",
        icon: 'pi pi-info-circle',
        accept: () => {
          isClear = true;
          this.report = {};
          this.isSearched = false;
        },
        reject: () => {
          isClear = false;
        }
      });
    }
    if (isClear) {
      this.buttonEnable = true;
      let temp = event.value.name.split('-');
      this.account = temp[0] + '-' + temp[1];
       this.accountNumberShow = temp[3];
      this.currency = event.value.currencyCode;
      this.accountNumber = event.value.no;

      if (this.currency != this.commonService.profileDetails.BaseCurrency) {


        this.reportType = [
          { name: 'Both', label: 1 },
          { name: 'Foreign Currency', label: 2 },
          { name: 'Base Currency', label: 3 }
        ];
      } else {
        this.reportType = [

          { name: 'Base Currency', label: 3 }
        ];
      }

      if (this.reportType.length == 1) {
        this.report = { name: 'Base Currency', label: 3 }

      }
    }
  }

  calculateBalance(index, object, openingBalance, openingBalanceType, type) {

    const amount = type == 'bc' ? Number(object.amount) : Number(object.foreignCurrencyAmount);
    if (index == 0) {
      const balance = openingBalanceType == 'Dr' ? openingBalance : openingBalance;
      return balance;
    } else {
      if (type == 'bc') {
        const balance = object.xactTypeCode == 'Dr' ? (Number(this.lastBalance) + amount) : (Number(this.lastBalance) - amount );
        return balance;
      } else {
        const balance = object.xactTypeCode == 'Dr' ? (Number(this.lastBalanceFC) + amount) : (Number(this.lastBalanceFC) - amount);
        return balance;
      }
    }
  }

  convertDateTimeFormart(date) {
    const pipe = new DatePipe('en-US');
    // const convertDate = pipe.transform(date, 'dd-MMM-yyyy');
    const convertDate = pipe.transform(new Date(), "dd-MMM-yyyy  HH:mm");
    return convertDate;
  }
  convertDateFormart(date) {
    const pipe = new DatePipe('en-US');
    const convertDate = pipe.transform(date, 'dd-MMM-yyyy');
    return convertDate;
  }
  clear() {
    this.fromDate = "";
    this.toDate = "";
    this.ledgerAccounts = {};
    this.report = {};
    this.isSearched = false;

  }
  absoluuteValue(amount) {
    
    

    const amountValue = this.currencyPipe.transform(amount, this.currency, '', '', 'en-US');
    //  let temp = this.currencyPipe.transform(amountValue, this.currency, '', '', 'en-US');
    //  let convertedAmount = Number(temp);

    return amountValue;

  }
  absoluuteValueForOpeningbalance(amount) {
  

    const amountValue = this.currencyPipe.transform(Math.abs(amount), this.currency, '', '', 'en-US');
    
    return amountValue;

  }
  // exportPdf() {
  //   const columns = [
  //     { title: 'Date', dataKey: 'date' },
  //     { title: 'Reference', dataKey: 'transactionId' },
  //     { title: 'Document No', dataKey: 'currency' },
  //     { title: 'FC Debit', dataKey: 'lineNarration ' },
  //     { title: 'FC Credit', dataKey: 'Debit' },
  //     { title: 'Rate', dataKey: 'Credit' },
  //     { title: 'BC Debit', dataKey: 'Balance' }


  //   ];
  //   const doc = new jsPDF()
  //    const data:any = this.ledgerStatementData.entries;
  //         autoTable(doc, {
  //           theme: 'grid',
  //           head:  columns ,
  //           body: data,
  //           headStyles: {
  //             fillColor: '#125386',
  //             fontSize: 10,
  //           } 
  //         })

  //         doc.autoPrint();
  //       doc.output('dataurlnewwindow');

  // }

  totalCalculateForFooter(entries) {

    for (let index = 0; index < entries.length; index++) {
      if ((Number(entries[index].foreignCurrencyAmount != 0)) && (entries[index].xactTypeCode == 'Dr')) {
        const amount = Number(entries[index].foreignCurrencyAmount);
        this.foreignDebitTotal = this.foreignDebitTotal + Math.abs(amount);
      }

      else if ((Number(entries[index].foreignCurrencyAmount != 0)) && (entries[index].xactTypeCode == 'Cr')) {
        const amount = Number(entries[index].foreignCurrencyAmount);
        this.foreignCreditTotal = this.foreignCreditTotal + Math.abs(amount);
      }

      if ((entries[index].xactTypeCode == 'Dr')) {
        const amount = Number(entries[index].amount);
        this.baseDebitTotal = this.baseDebitTotal + Math.abs(amount);
      }

      else if ((entries[index].xactTypeCode == 'Cr')) {
        const amount = Number(entries[index].amount);
        this.baseCreditTotal = this.baseCreditTotal + Math.abs(amount);
      }

    }



  }

  clearTotal() {
    this.foreignDebitTotal = 0;
    this.foreignCreditTotal = 0;
    this.baseDebitTotal = 0;
    this.baseCreditTotal = 0;
  }

  loadJvData(event: LazyLoadEvent) {
    this.pageinationData = event;
 
  }

  convertToReference(val){
    return val.toString().replace(/,/g, "");
  }
  
  exportExcel() {
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(this.ledgerStatementData.entries);
        const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, "products");
    });
}

saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
}




 

}

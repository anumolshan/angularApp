import { Component, OnInit } from '@angular/core';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/service/common.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import gql from 'graphql-tag';
import awsmobile from 'src/aws-exports';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { HelperView } from 'src/app/shared/helper.view';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-day-book',
  templateUrl: './day-book.component.html',
  styleUrls: ['./day-book.component.scss']

})
export class DayBookComponent implements OnInit {
  currentDate = new Date();
  fromDate: any = "";
  toDate: any = "";
  branchList: any[] = [];
  branch: any = {};
  transactionType: any[];
  transaction: any = {};
  dayBookList: any = {};
  isSearched: boolean = false;
  filteredBranchList: any = [];
  selectedBranch: any = {};
  filteredTransactionList: any = [];
  selectedTransaction: any = {};
  isSpinner: boolean = false;
  // pageinationData: any = {};
  totalRecords: number = 0;
  currency: any;
  public isExpanded:boolean = false;
  public expandedRows = {};
  constructor(public currencyPipe: CurrencyPipe, public commonService: CommonService, public translateService: TranslateService, private breadcrumbService: AppBreadcrumbService, private confirmationService: ConfirmationService, public messageService: MessageService
  ) {
    this.breadcrumbService.setItems([
      { label: 'settings.pages.account_ledger.breadcrumbs.breadcrumb1' },
      { label: 'settings.pages.day_book.breadcrumbs.breadcrumb1' }
    ]);
    this.translateService.setDefaultLang(this.commonService.selectedLanguage);
  }

  ngOnInit(): void {
    this.getClientsByRootClientid();

    this.transactionType = [
      { name: 'All' },
      { name: 'Journal Voucher' }
    ];
    this.selectedTransaction = this.transactionType[0];


  }
  ngDoCheck() {

    if (this.commonService.selectedLanguage !== this.commonService.lastSelectedLanguage) {
      this.commonService.lastSelectedLanguage = this.commonService.selectedLanguage;
      this.translateService.use(this.commonService.selectedLanguage);
    } else {
      this.translateService.setDefaultLang(this.commonService.selectedLanguage);
    }

  }
  
  convertDateTimeFormart(date) {
    const pipe = new DatePipe('en-US');
    const convertDate = pipe.transform(date, 'dd-MMM-yyyy HH:mm');
    return convertDate;
  }
  convertDateFormart(date) {
    const pipe = new DatePipe('en-US');
    const convertDate = pipe.transform(date, 'dd-MMM-yyyy');
    // const convertDate = pipe.transform(new Date(), "dd-MMM-yyyy  hh:mm");
    return convertDate;
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
      limit: 10,
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
  filterTransaction(event) {
    const filtered: any[] = [];
    const query = event.query;

    for (let i = 0; i < this.transactionType.length; i++) {
      const data = this.transactionType[i];
      if (data.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(data);
      }
    }

    this.filteredTransactionList = filtered;

  }

  async getDayBookStatements() {
   this.dayBookList.entries = [];
   this.isSpinner = true;
    const pipe = new DatePipe('en-US');
    this.isSearched = true;
    const from = pipe.transform(this.fromDate, "YYYY-MM-dd");
    const to = pipe.transform(this.toDate, "YYYY-MM-dd");
    const SaaSApiGraphQL = gql`
      query MyQuery($from: String!, $to: String!, $branch: String!, $transactionType: String,$limit: String,$offSet: String) {
        getDayBook(from: $from, to: $to, branch: $branch, transactionType: $transactionType, limit: $limit, offSet: $offSet) {
          body{
              totalDrAmount
              totalCrAmount
              entries{
                  transactionType
                  transactionDate
                  userName
                  reference
                  accountId
                  accountName
                  narration
                  currencyCode
                  amountFC
                  amountLC
                  xactTypeCode
              }
              count
          }
        }
      }`
    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger;

    const payLoad = {
      "from": from,
      "to": to,
      "branch": this.selectedBranch.PK,
      "transactionType": this.selectedTransaction.name != undefined ? this.selectedTransaction.name : 'All',
      "limit": '500',
      "offSet": '0'
    };
    try {

      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);

      if (returnResponse.graphqlData.data !== null && returnResponse.graphqlData.errors == undefined) {
        const tempLedgerStatement = returnResponse.graphqlData.data.getDayBook.body;
        this.totalRecords = tempLedgerStatement.count;
        let tempDayBookList = tempLedgerStatement;
        let lastDate = ""
        tempDayBookList.entries.forEach((element, index) => {


          element.debit = element.xactTypeCode == 'Dr' ? element.amountLC : 0;
          element.credit = element.xactTypeCode == 'Cr' ? element.amountLC : 0;
          if (index !== 0 && lastDate == element.transactionDate) {
            element.date = "";
          } else {
            lastDate = element.transactionDate;
            element.date = this.convertDateFormart(element.transactionDate);
          }

          element.accountNarration = element.accountId + " - " + element.accountName;
        });

        this.dayBookList = tempDayBookList;
        this.expandAll();
        this.isSpinner = false;
      } else {
        this.messageService.add({ severity: 'error', summary: 'validations.alert.error', detail: 'validations.alert.tech_error' });
        this.isSpinner = false;
      }


    } catch (err) {
      this.isSpinner = false;
      console.log('error posting to appsync: ', err);
    }

  }

  validationForDayBook() {

    // this.isSpinner = true;



    if (!HelperView.checkStringEmptyOrNull(this.fromDate)) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: this.translateService.instant('validations.alert.from_date') });

      return false;
    } else if (!HelperView.checkStringEmptyOrNull(this.toDate)) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: this.translateService.instant('validations.alert.to_date') });
      return false;

    } else if (this.selectedBranch && this.selectedBranch.PK == undefined || this.selectedBranch.PK == "" || this.selectedBranch.PK == null) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: this.translateService.instant('validations.alert.branch') });
      return false;

    } else {
      return true;
    }

  }

  search() {

    this.currentDate = new Date();
    if (this.validationForDayBook()) {
      this.getDayBookStatements();

    }
  }
  // loadDayBookData(event: LazyLoadEvent) {

  //   this.pageinationData = event;

  // }

  absoluteValue(amount) {
    const amountValue = this.currencyPipe.transform(amount, this.selectedBranch.BaseCurrency, '', '', 'en-US');
    return amountValue;
  }
  exportExcel() {
    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.dayBookList.entries);
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
  expandAll() {
    this.isExpanded = false;
    if (this.dayBookList.entries) {
    if(!this.isExpanded){
      this.dayBookList.entries.forEach(data =>{
        this.expandedRows[data.transactionType] = true;
      })
    } else {
      this.expandedRows={};
    }
    this.isExpanded = !this.isExpanded;
  }
  }
}

import { Component, OnInit } from '@angular/core';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/service/common.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MessageService, TreeNode } from 'primeng/api';
import { NodeService } from 'src/app/demo/service/nodeservice';
import awsmobile from 'src/aws-exports';
import gql from 'graphql-tag';
import { HelperView } from 'src/app/shared/helper.view';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-trial-balance',
  templateUrl: './trial-balance.component.html',
  styleUrls: ['./trial-balance.component.scss']
})
export class TrialBalanceComponent implements OnInit {


  branchList: any[];
  ledgerAccounts: any = {};
  reportType: any[];
  report: any = {};
  checked = false;
  isSearched = false;
  trialBalanceList: TreeNode[];
  initialLevel: any = {};
  level: any;
  levelList: any[];
  balanceAsOnDate: any;
  currentDate = new Date();
  fromDate: any;
  branchBasaeCurrency: any;
  fromDateOptional: any;
  selectedBranch: any;
  toDate: any;
  showClearOption = false;
  expand = false;
  subLevel = 1;
  tempTrailList: any[] = [];
  isSpinner: boolean;
  trialData: any = {};

  constructor(private nodeService: NodeService, public commonService: CommonService, public translateService: TranslateService, private breadcrumbService: AppBreadcrumbService, private currencyPipe: CurrencyPipe, public messageService: MessageService
  ) {
    this.breadcrumbService.setItems([
      { label: 'settings.pages.account_ledger.breadcrumbs.breadcrumb1' },
      { label: 'settings.pages.financial_reports.TrialBalance' }
    ]);
    this.translateService.setDefaultLang(this.commonService.selectedLanguage);
  }

  ngOnInit(): void {

    this.checked = true;
    this.getClientsByRootClientid();
    this.balanceAsOnDate = this.convertDateFormart(this.currentDate);
    this.reportType = [
      { name: 'Trial Balance' },
      { name: 'Periodic Trial Balance' }
    ];
    this.report = this.reportType[0];
    this.levelList = [
      { level: 'All' },
      { level: 1 },
      { level: 2 },
      { level: 3 }

    ];
  }

  setTrailBalanceRecursive() {
    if (this.tempTrailList && this.tempTrailList.length > 0) {
      this.tempTrailList.forEach((element) => {
        if (element.accountGroupCreditBal != '0') {
          this.trialData.creditTotal = this.trialData.creditTotal + Number(element.accountGroupCreditBal);
        } else {
          this.trialData.debitTotal = this.trialData.debitTotal + Number(element.accountGroupDebitBal);

        }
        element.styleClass = 'class' + element.depth;
        this.setColorRecursive(element,0);
      });
      this.trialBalanceList = this.tempTrailList;
    } else {
      this.isSpinner = false;

    }

  }
  ngDoCheck() {

    if (this.commonService.selectedLanguage !== this.commonService.lastSelectedLanguage) {
      this.commonService.lastSelectedLanguage = this.commonService.selectedLanguage;
      this.translateService.use(this.commonService.selectedLanguage);
    } else {
      this.translateService.setDefaultLang(this.commonService.selectedLanguage);
    }

  }
  view() {
    this.currentDate = new Date();
    this.isSearched = true;
  }
  convertDateFormart(date) {
    const pipe = new DatePipe('en-US');
    const convertDate = pipe.transform(date, 'dd-MMM-yyyy');
    return convertDate;
  }
  getTrialBalance() {
    if (this.validationForTrialBalance()) {
      this.trialData.creditTotal = 0;
      this.trialData.debitTotal = 0;
      this.tempTrailList = [];
      this.trialBalanceList = [];
      this.isSpinner = true;
      this.currentDate = new Date();
      this.fromDate = this.convertDateFormart(this.currentDate);
      this.isSearched = true;
      this.getTrialBalanceApiCall();
    }

  }
  getSubGroups(event) {
    //  let childList =  this.generateTreeNodes(secondData, false);
    //  let tempList =   this.generateTreeNodes(leafData, true)
    //  event.node.children = [ ...childList, ...tempList];
    //  event.node.children =this.generateTreeNodes(secondData, false);
    //  this.trialBalanceList = [...this.trialBalanceList];

    //  this.expandAll();
  }
  expandAll() {

    this.trialBalanceList.forEach(node => {
      this.expandRecursive(node, true);
    });
    this.trialBalanceList = [...this.trialBalanceList];

  }
  collapseAll() {
    this.trialBalanceList.forEach(node => {
      this.expandRecursive(node, false);
    });
    this.trialBalanceList = [...this.trialBalanceList];
  }

  expandRecursive(node: TreeNode, isExpand: boolean) {

    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }

  }

  expandBasedOnSelectedLevel() {
    this.collapseAll();
    this.trialBalanceList.forEach(element => {
      for (let index = 0; index < this.initialLevel.level; index++) {
        this.expandRecursiveBasedOnSelect(element, true);
      }
    });
    this.trialBalanceList = [...this.trialBalanceList];
  }
  expandRecursiveBasedOnSelect(node: TreeNode, isExpand: boolean) {

    node.expanded = isExpand;

    if ((node.children && this.initialLevel.level > 1) && (this.initialLevel.level <= node.children.length)) {
      for (let index = 0; index < this.initialLevel.level; index++) {
        this.expandRecursiveBasedOnSelect(node.children[index], isExpand);
      }
    } else if ((node.children && this.initialLevel.level > 1)) {
      for (let index = 0; index < node.children.length; index++) {
        this.expandRecursiveBasedOnSelect(node.children[index], isExpand);
      }
    }
  }

  setDate(selecteDate, type) {
    
    if (type == 'to') {
      this.balanceAsOnDate = this.convertDateFormart(selecteDate);
    }
    else if (type == 'from') {
      this.toDate = this.convertDateFormart(selecteDate);
    }

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
 `;
    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_administration_permission;
    const payLoad = {
      GSI1PK: 'ROOTCLI_2A16BbviR2gxp86o2llHwxBktn4',
      limit: 10,
      nextToken: ''
    };
    try {
      const returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);

      if (returnResponse.graphqlData.data != null && returnResponse.graphqlData.data.getClientsByRootClientid != null) {

        this.branchList = returnResponse.graphqlData.data.getClientsByRootClientid.items;
        this.selectedBranch = this.branchList[0];

      }


    } catch (err) {

      console.log('error posting to appsync: ', err);
    }
  }

  branchOnChange(event) {
    this.branchBasaeCurrency = event.value.BaseCurrency;

  }

  currencyFormat(amount) {
    let amountValue = this.currencyPipe.transform(Number(Math.abs(amount)), this.branchBasaeCurrency, '', '', 'en-US',); 

    return amountValue;
  }
  currencyFormatforBalance(amount) {
    let amountValue = this.currencyPipe.transform(Number(amount), this.branchBasaeCurrency, '', '', 'en-US',); 

    return amountValue;
  }



  validationForTrialBalance() {

    if (!HelperView.checkStringEmptyOrNull(this.balanceAsOnDate)) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: this.translateService.instant('validations.alert.to_date') });
      setTimeout(() => document.getElementById('to').focus(), 100);

      return false;
    } else if (this.selectedBranch && this.selectedBranch.PK == undefined || this.selectedBranch.PK == '' || this.selectedBranch.PK == null) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: this.translateService.instant('validations.alert.branch') });
      setTimeout(() => document.getElementById('account').focus(), 100);
      return false;

    }
    else if (!HelperView.checkStringEmptyOrNull(this.report.name)) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: this.translateService.instant('Type is required') });
      setTimeout(() => document.getElementById('report').focus(), 100);
      return false;

    } else if (!HelperView.checkStringEmptyOrNull(this.fromDate) && this.report.name == 'Periodic Trial Balance') {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: this.translateService.instant('validations.alert.from_date') });
      setTimeout(() => document.getElementById('from').focus(), 100);
      return false;

    }
    else {
      return true;
    }

  }

  exportExcel() {
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.trialBalanceList);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'products');
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }


  // exportPdf() {
  //     const columns = [
  //       { title: 'Acc Code', dataKey: 'date' },
  //       { title: 'Acc Name', dataKey: 'transactionId' },
  //       { title: 'Currency', dataKey: 'currency' },
  //       { title: 'Fc Balance', dataKey: 'lineNarration ' },
  //       { title: 'Debit', dataKey: 'Debit' },
  //       { title: 'Credit', dataKey: 'Credit' }


  //     ];
  //     const doc = new jsPDF()
  //      const data:any = this.trialBalanceList;
  //           autoTable(doc, {
  //             theme: 'grid',
  //             head:  columns ,
  //             body: data,
  //             headStyles: {
  //               fillColor: '#125386',
  //               fontSize: 10,
  //             }
  //           })

  //           doc.autoPrint();
  //         doc.output('dataurlnewwindow');

  //   }

  chooseLevel() {
    this.showClearOption = true;
    this.expand = true;

  }

  setColorRecursive(node,currentIndex) {

    currentIndex ++;
    if (node.children) {
      node.children.forEach((childNode) => {
        if (childNode.leaf == 'false') {
          // childNode.styleClass =  'class'+ childNode.depth;
          childNode.styleClass = 'class0' + currentIndex;
        } else {
          childNode.styleClass = 'leafClass';
        }
        this.setColorRecursive(childNode,currentIndex);
      });

    }

  }
  async getTrialBalanceApiCall() {
    
    const SaaSApiGraphQL = gql`
    query MyQuery($branchCode: String!, $fromDate: String, $toDate: String!, $Type: String!, $hideZeroBal: String!) {
      getTrialBalance(branchCode: $branchCode, toDate: $toDate, Type: $Type, fromDate: $fromDate, hideZeroBal: $hideZeroBal) {
        accountGroupName
        accountGroupCreditBal
        accountGroupDebitBal
        openingBalance
        closingBalance
        depth
        leaf
        nonEmpty
        children{
          accountGroupName
          accountGroupCreditBal
          accountGroupDebitBal
          depth
          leaf
          accountCode
          id
          accountName
          currency
          balanceFC
          balanceLC
          openingBalance
          closingBalance
          xactTypeCode
          nonEmpty
          children{
            accountGroupName
            accountGroupCreditBal
            accountGroupDebitBal
            depth
            leaf
            accountCode
            id
            accountName
            currency
            balanceFC
            balanceLC
            openingBalance
            closingBalance
            xactTypeCode
            nonEmpty
            children{
              accountGroupName
              accountGroupCreditBal
              accountGroupDebitBal
              depth
              leaf
              accountCode
              id
              accountName
              currency
              balanceFC
              balanceLC
              openingBalance
              closingBalance
              xactTypeCode
              nonEmpty
              children{
                accountGroupName
                accountGroupCreditBal
                accountGroupDebitBal
                depth
                leaf
                accountCode
                id
                accountName
                currency
                balanceFC
                balanceLC
                openingBalance
                closingBalance
                xactTypeCode
                nonEmpty
                children{
                      accountGroupName
                      accountGroupCreditBal
                      accountGroupDebitBal
                      depth
                      leaf
                      accountCode
                      id
                      accountName
                      currency
                      balanceFC
                      balanceLC
                      openingBalance
                      closingBalance
                      xactTypeCode
                      nonEmpty
                      children{
                        accountGroupName
                        accountGroupCreditBal
                        accountGroupDebitBal
                        depth
                        leaf
                        accountCode
                        id
                        accountName
                        currency
                        balanceFC
                        balanceLC
                        openingBalance
                        closingBalance
                        xactTypeCode
                        nonEmpty
                        children{
                          accountGroupName
                          accountGroupCreditBal
                          accountGroupDebitBal
                          depth
                          leaf
                          accountCode
                          id
                          accountName
                          currency
                          balanceFC
                          balanceLC
                          openingBalance
                          closingBalance
                          xactTypeCode
                          nonEmpty
        }
        }
        }    }
        }
        }
        }
      }
    }`;
    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_nominalAccount;
    const payLoad = {

      "fromDate": this.dateFormart(this.toDate),
      "toDate":  this.dateFormart(this.balanceAsOnDate),
      "branchCode": this.branchList[0].PK,
      "Type": this.report.name,
      "hideZeroBal": this.checked ? "true" : "false"
    }

    try {
      const returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);

      if (returnResponse.graphqlData.data != null && returnResponse.graphqlData.errors == undefined) {
        this.tempTrailList = returnResponse.graphqlData.data.getTrialBalance;
        const data = [];
        for (const iterator of this.tempTrailList) {
          if (iterator.accountGroupName == "Assets") {
            data[0] = iterator;
          }
          if (iterator.accountGroupName == "Liabilities") {
            data[1] = iterator;
          }
          if (iterator.accountGroupName == "Equity") {
            data[2] = iterator;
          }
          if (iterator.accountGroupName == "Income") {
            data[3] = iterator;
          }
          if (iterator.accountGroupName == "Expenses") {
            data[4] = iterator;
          }
          
        }
        this.tempTrailList = data;
        this.setTrailBalanceRecursive();
        this.isSpinner = false;
      }
      this.isSpinner = false;


    } catch (err) {
      this.isSpinner = false;
      console.log('error posting to appsync: ', err);
    }
  }

  dateFormart(date) {
    const pipe = new DatePipe('en-US');
    const convertDate = pipe.transform(date, 'yyyy-MM-dd');
    return convertDate;
  }


}

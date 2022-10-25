import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, TreeNode } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { NodeService } from 'src/app/demo/service/nodeservice';
import { CommonService } from 'src/app/service/common.service';
import { HelperView } from 'src/app/shared/helper.view';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import gql from 'graphql-tag';
import awsmobile from 'src/aws-exports';

@Component({
  selector: 'app-profit-loss',
  templateUrl: './profit-loss.component.html',
  styleUrls: ['./profit-loss.component.scss']
})
export class ProfitLossComponent implements OnInit {
  branchList: any[];
  ledgerAccounts: any = {};
  reportType: any[];
  report: any = {};
  checked: boolean = false;
  isSearched: boolean = false;
  profitAndLossList: TreeNode[];
  initialLevel: any = {};
  level: any;
  levelList: any[];
  currentDate = new Date();
  fromDate: any;
  branchBasaeCurrency: any;
  selectedBranch: any;
  toDate: any;
  currentDateShow: any;
  showClearOption: boolean = false;
  tempProfitAndLossList: any[] = [];
  isSpinner: boolean;
  profitAndLossData: any = {};
  profitAndLossForFooter: any;
  
  constructor(private nodeService: NodeService, public commonService: CommonService, public translateService: TranslateService, private breadcrumbService: AppBreadcrumbService,private currencyPipe: CurrencyPipe,public messageService: MessageService
    ) {
   this.breadcrumbService.setItems([
     { label: 'settings.pages.account_ledger.breadcrumbs.breadcrumb1' },
     { label: 'settings.pages.financial_reports.profit_loss_statement' }
   ]);
   this.translateService.setDefaultLang(this.commonService.selectedLanguage);
 }

  ngOnInit(): void {
    this.checked = true;
    this.nodeService.getProfitAndLoss().then(files => this.profitAndLossList = files);

    this.getClientsByRootClientid();
    this.toDate = this.convertDateFormart(this.currentDate);
    this.levelList = [
      { level: 'All' },
      { level: 1 },
      { level: 2 },
      { level: 3 }
    ];

    setTimeout(() => {
      this.getPF();

    }, 1000);
  }

  setProfitAndLossRecursive() {
    if (this.tempProfitAndLossList && this.tempProfitAndLossList.length > 0) {
      this.tempProfitAndLossList.forEach((element) => {
        if (element.amount != '0') {
          this.profitAndLossData.creditTotal = this.profitAndLossData.creditTotal + Number(element.amount);
        } 
        element.styleClass = 'class' + element.depth;
        this.setColorRecursive(element,0);
      });
      this.profitAndLossList = this.tempProfitAndLossList;
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

  getPF() {
    if (this.profitAndLossList && this.profitAndLossList.length > 0) {
    this.profitAndLossList.forEach((element, index) => {
      element.styleClass = "class01"; 
      this.setColorRecursive(element, index);
    });
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
  generateTreeNodes(data, isChild) {
    const allTreeNodes: TreeNode[] = [];
    if (data.length > 0) {
      let rootNode: TreeNode;
      data.forEach(element => {
        rootNode = { data: element, children: [], leaf: isChild == true ? true : false, expanded: isChild == true ? true : false };
        allTreeNodes.push(rootNode);
      });
    }
    return allTreeNodes;

  }
  getProfitAndLossStatement(type) {
    
    // if (this.validationForTrialBalance()) {
    //   this.profitAndLossData.creditTotal = 0;
    //   this.profitAndLossData.debitTotal = 0;
    //   this.tempProfitAndLossList = [];
    //   this.profitAndLossList = [];
    //   this.isSpinner = true;
    //   this.currentDate = new Date();
    //   this.currentDateShow = this.convertDateFormart(this.currentDate);
    //   this.isSearched = true;
    //   this.getProfitAndLossApiCall();
    // }

    if (this.validationForTrialBalance()) {
      this.isSpinner = true;

      this.profitAndLossData.creditTotal = 0;
      this.profitAndLossData.debitTotal = 0;
      this.tempProfitAndLossList = [];
      this.profitAndLossList = [];
      this.currentDateShow = this.convertDateFormart(this.currentDate);
      this.currentDate = new Date();
      const pipe = new DatePipe('en-US');
      let fromDate;
      let toDate;
      const currentTime = new Date();
      const lastWeekDate = currentTime.setDate(currentTime.getDate() - 14);
      if (type == 'search') {
        fromDate = this.convertDateFormart(this.profitAndLossData.from);
        toDate = this.convertDateFormart(this.profitAndLossData.to);
      } else {
        fromDate = pipe.transform(lastWeekDate, 'yyyy-MM-dd');
        this.profitAndLossData.from = currentTime;
        toDate = pipe.transform(new Date(), 'yyyy-MM-dd');
        this.profitAndLossData.to = new Date();
      }
      this.isSearched = true;
      this.getProfitAndLossApiCall();

    }
}
  expandAll() {

    this.profitAndLossList.forEach(node => {
      this.expandRecursive(node, true);
    });

    this.profitAndLossList = [...this.profitAndLossList]

  }
  collapseAll() {
    this.profitAndLossList.forEach(node => {
      this.expandRecursive(node, false);
    });
    this.profitAndLossList = [...this.profitAndLossList]
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
    this.profitAndLossList.forEach(element => {
      for (let index = 0; index < this.initialLevel.level; index++) {
        this.expandRecursiveBasedOnSelect(element, true);
      }
    });
    this.profitAndLossList = [...this.profitAndLossList];
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
      this.toDate = this.convertDateFormart(selecteDate);
    } 
    else if(type == 'from') {
      this.fromDate = this.convertDateFormart(selecteDate);
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


    } catch (err) {
     
      console.log('error posting to appsync: ', err);
    }
  }

  branchOnChange(event) {

    this.branchBasaeCurrency = event.value.BaseCurrency;
    
  }

  currencyFormat(amount) {
    // const amountValue = this.currencyPipe.transform(amount, this.branchBasaeCurrency, '', '', 'en-US');
    // return amountValue;
    let amountValue = this.currencyPipe.transform(Number(amount), this.branchBasaeCurrency, '', '', 'en-US',); 
    return amountValue;
  }

  validationForTrialBalance() {
    
   
    if (!HelperView.checkStringEmptyOrNull(this.profitAndLossData.from)) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: this.translateService.instant('validations.alert.from_date') });
      setTimeout(() => document.getElementById('from').focus(), 100);
      return false;
    } else if (!HelperView.checkStringEmptyOrNull(this.profitAndLossData.to)) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: this.translateService.instant('validations.alert.to_date') });
      setTimeout(() => document.getElementById('to').focus(), 100);
      return false;

    } 
     else if (this.selectedBranch && this.selectedBranch.PK == undefined || this.selectedBranch.PK == "" || this.selectedBranch.PK == null) {
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: this.translateService.instant('validations.alert.branch') });
      setTimeout(() => document.getElementById('account').focus(), 100);
      return false;

    } 
  
    else {
      return true;
    }
  }
  

  

  exportExcel() {
    import("xlsx").then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(this.profitAndLossList);
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
chooseLevel(){
  this.showClearOption = true;
}

setColorRecursive(node,currentIndex) {

  currentIndex ++;
  if (node.children) {
    node.children.forEach((childNode) => {
      if (childNode.leaf == 'false') {
        childNode.styleClass = 'class0' + currentIndex;
      } else {
        childNode.styleClass = 'leafClass';
      }
      this.setColorRecursive(childNode,currentIndex);
    });

  }

}
async getProfitAndLossApiCall(){
  
  const SaaSApiGraphQL = gql`
  query MyQuery($branchCode: String!, $fromDate: String!, $toDate: String!,$hideZeroBal: String!) {
    getProfitAndLoss(branchCode: $branchCode, toDate: $toDate, fromDate: $fromDate,hideZeroBal:$hideZeroBal) {
      accountGroupName
      amount
      depth
      leaf
      nonEmpty
      children{
        accountGroupName
        accountCode
        id
        accountName
        amount
        depth
        leaf
        nonEmpty
        children{
          accountGroupName
          accountCode
          id
          accountName
          amount
          depth
          leaf
          nonEmpty
          children{
            accountGroupName
            accountCode
            id
            accountName
            amount
            depth
            leaf
            nonEmpty
            children{
              accountGroupName
              accountCode
              id
              accountName
              amount
              depth
              leaf
              nonEmpty
              children{
                    accountGroupName
                    accountCode
                    id
                    accountName
                    amount
                    depth
                    leaf
                    nonEmpty
                    children{
                      accountGroupName
                      accountCode
                      id
                      accountName
                      amount
                      depth
                      leaf
                      nonEmpty
                      children{
                        accountGroupName
                        accountCode
                        id
                        accountName
                        amount
                        depth
                        leaf
                        nonEmpty
      }
      }
      }    }
      }
      }
      }
    }
  }
  `;
  const endPoint = awsmobile.aws_appsync_graphqlEndpoint_nominalAccount;
  const payLoad = {
    "fromDate": this.dateFormart(this.fromDate),
    "toDate":  this.dateFormart(this.toDate),
    "branchCode": this.branchList[0].PK,
    "hideZeroBal": this.checked ? "true" : "false"
  }
  try {
    const returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);

    if (returnResponse.graphqlData.data != null && returnResponse.graphqlData.errors == undefined) {
      this.tempProfitAndLossList = returnResponse.graphqlData.data.getProfitAndLoss;
      this.profitAndLossForFooter = Number(this.tempProfitAndLossList[1].amount) + Number(this.tempProfitAndLossList[0].amount);
      this.setProfitAndLossRecursive();
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

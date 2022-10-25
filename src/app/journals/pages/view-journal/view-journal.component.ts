import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import gql from 'graphql-tag';
import awsmobile from 'src/aws-exports';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { CommonService } from 'src/app/service/common.service';
import { SettingsService } from 'src/app/settings/service/settings.service';
import { DatePipe } from '@angular/common';
import { Functionalities } from 'src/app/enum/functionality';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-view-journal',
  templateUrl: './view-journal.component.html',
  styleUrls: ['./view-journal.component.scss']
})
export class ViewJournalComponent implements OnInit {


  isSpinner: boolean;
  journalList: any[] = [];
  journalVoucherData: any = {};
  currentDate = new Date();
  totalrecords: number = 0;
  voucherKey: number;
  pageinationData: any = {};
  accessList: any = {};
  branchList: any[] = [];

  constructor(public commonService: CommonService, public messageService: MessageService, public translateService: TranslateService,
    private breadcrumbService: AppBreadcrumbService, public service: SettingsService, public router: Router,
    private confirmationService: ConfirmationService) {
    this.breadcrumbService.setItems([
      { label: 'settings.pages.view_journal.breadcrumbs.breadcrumb1' },
      { label: 'settings.pages.view_journal.breadcrumbs.breadcrumb2' }
    ]);
    this.translateService.setDefaultLang(this.commonService.selectedLanguage);
  }

  ngOnInit(): void {
    this.getClientsByRootClientid();
    this.commonService.accessList = Functionalities;
    this.commonService.lastLocation = window.location.hash;
    if (this.commonService.checkItemExist(Functionalities.ListJournalVoucher)) {
     
    } else {
      this.router.navigate(['/']);
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

  async getJournalList(type) {
    this.isSpinner = true;
    if (this.validationForJournal(type)) {
      this.totalrecords = 0;
      const pipe = new DatePipe('en-US');
      let fromDate;
      let toDate;
      const currentTime = new Date();
      const lastWeekDate = currentTime.setDate(currentTime.getDate() - 14);
      if (type == 'search') {
        fromDate = pipe.transform(this.journalVoucherData.from, 'yyyy-MM-dd');
        toDate = pipe.transform(this.journalVoucherData.to, 'yyyy-MM-dd');
      } else {
        fromDate = pipe.transform(lastWeekDate, 'yyyy-MM-dd');
        this.journalVoucherData.from = currentTime;
        toDate = pipe.transform(new Date(), 'yyyy-MM-dd');
        this.journalVoucherData.to = new Date();
      }

      const SaaSApiGraphQL = gql`
      query MyQuery($limit: Int!, $offSet: Int!, $from: String, $to: String , $voucherNoSearch: String) {
        getAllJournalVouchers(limit: $limit, offSet: $offSet, to: $to, voucherNoSearch: $voucherNoSearch, from: $from) {
          body {
            id
            branch
            amount
            transactedOn
            narration
          }
        }
      }`

      const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger;
      const payLoad = {
        limit: this.pageinationData.rows,
        offSet: this.pageinationData.first,
        from: fromDate,
        to: toDate,
        voucherNoSearch: this.voucherKey ? this.voucherKey : ''
      };
      try {
        let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);

        if ((returnResponse.graphqlData.data != null && returnResponse.graphqlData.errors == undefined)) {
          const tempJournalList = returnResponse.graphqlData.data.getAllJournalVouchers.body;

          const tempList = [];
          tempJournalList.forEach(journal => {

            journal.BranchName = journal.branch ? this.getBranchNameById(journal.branch) : '';
            journal.amount = Number(journal.amount);
            journal.BaseCurrency = journal.branch ? this.getCurrencyById(journal.branch) : '';
            journal.Date = this.convertDateFormart(journal.transactedOn)
            tempList.push(journal);
          });
          this.sortMyList(tempList);
          this.getJournalListCount(fromDate, toDate, type);

        }


      } catch (err) {
        this.isSpinner = false;
        console.log('error posting to appsync: ', err);
      }
    }
    this.isSpinner = false;
  }

  validationForJournal(type) {

    if (type == 'search') {
      if (!this.journalVoucherData.from) {
        setTimeout(() => document.getElementById('from').focus());
        this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: 'From Date required' });
        return false;
      } else if (!this.journalVoucherData.to) {
        setTimeout(() => document.getElementById('to').focus());
        this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: 'To Date required' });
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  sortMyList(list) {
    this.journalList = [];
    const sortMyList = list.sort((a, b) => a.Date - b.Date);
    this.journalList = sortMyList;
    this.isSpinner = false;
  }

  convertDateFormart(date) {
    const pipe = new DatePipe('en-US');
    const convertDate = pipe.transform(date, 'dd-MMM-yyyy');
    return convertDate;
  }

  async getJournalListCount(from, to, type) {

    const SaaSApiGraphQL = gql`
    query MyQuery($from: String!, $to: String!, $voucherNoSearch: String) {
      GetJournalVoucherTotalRecords(from: $from, to: $to, voucherNoSearch: $voucherNoSearch) {
        statusCode
        count
      }
    }
    
      `

    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger;
    const payLoad = {
      from: from,
      to: to,
      voucherNoSearch: this.voucherKey ? this.voucherKey : ''
    };
    try {
      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);

      if (returnResponse.graphqlData.data.GetJournalVoucherTotalRecords && returnResponse.graphqlData.data.GetJournalVoucherTotalRecords.count != null) {
        this.totalrecords = returnResponse.graphqlData.data.GetJournalVoucherTotalRecords.count;
      }

    } catch (err) {
      this.isSpinner = false;
      console.log('error posting to appsync: ', err);
    }

  }

  loadJvData(event: LazyLoadEvent) {

    this.pageinationData = event;
    this.getJournalList('intial');
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
  }`

    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_administration_permission;
    const payLoad = {
      GSI1PK: 'ROOTCLI_2A16BbviR2gxp86o2llHwxBktn4',
      limit: 10,
      nextToken: ''
    };
    try {
      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);

      if (returnResponse.graphqlData.data.getClientsByRootClientid && returnResponse.graphqlData.data.getClientsByRootClientid != null) {
        this.branchList = returnResponse.graphqlData.data.getClientsByRootClientid.items;
      }

    } catch (err) {
      this.isSpinner = false;
      console.log('error posting to appsync: ', err);
    }
  }
  async deleteJournal(journal) {


    const SaaSApiGraphQL = gql`
    mutation MyMutation($id: String!) {
      DeleteJournalVoucherById(id: $id) {
        statusCode
        body{
            id
        }
      }
    }
      `

    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger;
    const payLoad = {
      id: journal.id
    };

    try {
      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);

      const body = {
        graphqlData: returnResponse.graphqlData.data
      }
      if ((returnResponse.graphqlData.data.DeleteJournalVoucherById != null)) {

        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Journal Deleted Successfully' });

      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Deletion Failed' });
      }
      this.isSpinner = false;
      setTimeout(() => {
        this.getJournalList('initial');
      }, 1000);

    } catch (err) {
      this.isSpinner = false;
      console.log('error posting to appsync: ', err);
    }
  }

  getCurrencyById(branchId) {


    const branchObj = this.branchList.find((branch) => {
      if (branchId == branch.PK) {

        return branch;
      }
    })
    if (branchObj) {
      return branchObj.BaseCurrency


    }
  }

  getBranchNameById(branchId) {
    const branchObj = this.branchList.find((branch) => {
      if (branchId == branch.PK) {

        return branch;
      }
    });
    if (branchObj) {
      return branchObj.Name;
    }
  }
  confirmDialogForJournal(journal) {
    this.confirmationService.confirm({
      message: this.translateService.instant('validations.alert.delete'),
      header: this.translateService.instant('validations.common.Content.delete_confirmation_Label'),
      icon: 'pi pi-info-circle',
      accept: () => {
        this.isSpinner = true;
        this.deleteJournal(journal);
      },
      reject: () => {

      }
    });
  }

  editJournal(object, type) {
    this.router.navigate(['/journals/create-journal'], { queryParams: { jvId: object.id, type: type } });
  }

  clear(type) {
    this.voucherKey = null;
    this.getJournalList(type);
  }

}

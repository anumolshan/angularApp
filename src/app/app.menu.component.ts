import {Component, OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {AppComponent} from './app.component';
import {AppMainComponent} from './app.main.component';
import { CommonService } from './service/common.service';
import axios from 'axios';
import gql from 'graphql-tag';
import { print } from 'graphql';
import awsmobile from 'src/aws-exports';
import { Auth, Storage } from 'aws-amplify';
@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {


    companyDetails: any[] = [];

    constructor(public app: AppComponent, public appMain: AppMainComponent,public translateService: TranslateService,public commonService: CommonService) {

         }

    ngOnInit() {
        // this.model = [
        //     {
        //         label: 'Favorites', icon: 'pi pi-fw pi-home',
        //         items: [
        //             {label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/']}
        //         ]
        //     },
        //     {
        //         label: 'UI Kit', icon: 'pi pi-fw pi-star', routerLink: ['/uikit'], badge: 6,
        //         items: [
        //             {label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout']},
        //             {label: 'Float Label', icon: 'pi pi-fw pi-bookmark', routerLink: ['/uikit/floatlabel']},
        //             {label: 'Invalid State', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/uikit/invalidstate']},
        //             {label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input']},
        //             {label: 'Button', icon: 'pi pi-fw pi-mobile', routerLink: ['/uikit/button'], class: 'rotated-icon'},
        //             {label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table']},
        //             {label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list']},
        //             {label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree']},
        //             {label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel']},
        //             {label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay']},
        //             {label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media']},
        //             {label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'], preventExact: true},
        //             {label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message']},
        //             {label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file']},
        //             {label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts']},
        //             {label: 'Misc', icon: 'pi pi-fw pi-circle-off', routerLink: ['/uikit/misc']}
        //         ]
        //     },
        //     {
        //         label:'Prime Blocks', icon:'pi pi-fw pi-prime', routerLink: ['/blocks'],
        //         items:[
        //             {label: 'Free Blocks', icon: 'pi pi-fw pi-eye', routerLink: ['/blocks']},
        //             {label: 'All Blocks', icon: 'pi pi-fw pi-globe', url: ['https://www.primefaces.org/primeblocks-ng'], target: '_blank'},
        //         ]
        //     },
        //     {
        //         label: 'Utilities', icon: 'pi pi-fw pi-compass', routerLink: ['/utilities'],
        //         items: [
        //             {label: 'PrimeIcons', icon: 'pi pi-fw pi-prime', routerLink: ['utilities/icons']},
        //             {label: 'PrimeFlex', icon: 'pi pi-fw pi-desktop', url: ['https://www.primefaces.org/primeflex/'], target: '_blank'},
        //         ]
        //     },
        //     {
        //         label: 'Pages', icon: 'pi pi-fw pi-briefcase', routerLink: ['/pages'], badge: 8, badgeStyleClass: 'teal-badge',
        //         items: [
        //             {label: 'Crud', icon: 'pi pi-fw pi-pencil', routerLink: ['/pages/crud']},
        //             {label: 'Calendar', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/pages/calendar']},
        //             {label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/pages/timeline']},
        //             {label: 'Landing', icon: 'pi pi-fw pi-globe', url: 'assets/pages/landing.html', target: '_blank'},
        //             {label: 'Login', icon: 'pi pi-fw pi-sign-in', routerLink: ['/login']},
        //             {label: 'Invoice', icon: 'pi pi-fw pi-dollar', routerLink: ['/pages/invoice']},
        //             {label: 'Help', icon: 'pi pi-fw pi-question-circle', routerLink: ['/pages/help']},
        //             {label: 'Error', icon: 'pi pi-fw pi-times-circle', routerLink: ['/error']},
        //             {label: 'Not Found', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/notfound']},
        //             {label: 'Access Denied', icon: 'pi pi-fw pi-lock', routerLink: ['/access']},
        //             {label: 'Empty', icon: 'pi pi-fw pi-circle-off', routerLink: ['/pages/empty']}
        //         ]
        //     },
        //     {
        //         label: 'Hierarchy', icon: 'pi pi-fw pi-align-left',
        //         items: [
        //             {
        //                 label: 'Submenu 1', icon: 'pi pi-fw pi-align-left',
        //                 items: [
        //                     {
        //                         label: 'Submenu 1.1', icon: 'pi pi-fw pi-align-left',
        //                         items: [
        //                             {label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-align-left'},
        //                             {label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-align-left'},
        //                             {label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-align-left'},
        //                         ]
        //                     },
        //                     {
        //                         label: 'Submenu 1.2', icon: 'pi pi-fw pi-align-left',
        //                         items: [
        //                             {label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-align-left'}
        //                         ]
        //                     },
        //                 ]
        //             },
        //             {
        //                 label: 'Submenu 2', icon: 'pi pi-fw pi-align-left',
        //                 items: [
        //                     {
        //                         label: 'Submenu 2.1', icon: 'pi pi-fw pi-align-left',
        //                         items: [
        //                             {label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-align-left'},
        //                             {label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-align-left'},
        //                         ]
        //                     },
        //                     {
        //                         label: 'Submenu 2.2', icon: 'pi pi-fw pi-align-left',
        //                         items: [
        //                             {label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-align-left'},
        //                         ]
        //                     },
        //                 ]
        //             }
        //         ]
        //     },
        //     {
        //         label: 'Start', icon: 'pi pi-fw pi-download',
        //         items: [
        //             {
        //                 label: 'Buy Now', icon: 'pi pi-fw pi-shopping-cart', url: ['https://www.primefaces.org/store']
        //             },
        //             {
        //                 label: 'Documentation', icon: 'pi pi-fw pi-info-circle', routerLink: ['/documentation']
        //             }
        //         ]
        //     }
        // ];
        //  this.model = [
           
        //             {
        //         label: 'topbar.ledger',
        //         items: [
        //             {
        //                 PK:'FUN_2A3Rb38ggi0UbpxiOhKdLJhuA5z', label: 'side_menu.dashboard', icon: faHome,routerLink:['/']
        //             },
        //             {
        //                 label:'side_menu.reciept_payment', icon:faUniversity,routerLink: ['/banking'],
        //                 items: [
        //                     {
        //                         PK:'FUN_2A3RvMnhbNAF1n2qnwxarKbXim3', label: 'side_menu.reciept' , icon: faReceipt,routerLink: ['/']
        //                     },
        //                     {
        //                         PK:'FUN_2A3SEV55vmxmfnUTv8srvYL4Gyn', label: 'side_menu.payment', icon: faFileInvoiceDollar,routerLink: ['/']
        //                     },
        //                     {
        //                         PK:'FUN_2A3SlYt166oatCkG0xL880HQ0eh', label: 'side_menu.contra_vouchers', icon: faSort,routerLink: ['/']
        //                     }
        //                 ]
        //             },
        //             {
        //                 label: 'side_menu.journals', icon: faScroll,routerLink: ['/journals'],
        //                 items: [
        //                     {
        //                         PK:'FUN_2A3T6UfGtWaKpEjTfL0nuRlCADB', label: 'side_menu.journal_vouchers', icon: faFileLines,routerLink:['/journals/create-journal'],
        //                     }
        //                 ]
        //             },
        //             {
        //                 label: 'side_menu.financial_reports', icon:faChartLine,
        //                 items: [
        //                     {
        //                         PK:'FUN_2A3TIs7yRN5djo4kju3pCzvYDLo', label: 'side_menu.day_book', icon: faBook,
        //                     },
        //                     {
        //                         PK:'FUN_2A3Tamt5Tr5UTcwtKmItgeNENJl', label: 'side_menu.account_ledger', icon: faChartColumn,
        //                     },
        //                     {
        //                         PK:'FUN_2A3TiW5sPiMMH843gsO7xdv9WRB', label: 'side_menu.trial_balance', icon: faScaleBalanced,
        //                     },
        //                     {
        //                         PK:'FUN_2A3U2mY2PwzQ3xmHwLQKcZwJcJe', label: 'side_menu.balance_sheet', icon: faChartLine,
        //                     },
        //                     {
        //                         PK:'FUN_2A3UAoUDU1qr8ZEEDohIqaHW1kh', label: 'side_menu.profit_loss_statement', icon: faHandHoldingDollar,
        //                     }
        //                 ]
        //             },
        //             {
        //                 PK:'FUN_2A3UY7P2y88OYLsQFnvSTSpI0EB', label: 'side_menu.settings', icon: faCog,routerLink: ['/settings']
        //             }
        //         ]
        //     },
        // ]

    }

    onMenuClick() {
        this.appMain.menuClick = true;
    }

     ngDoCheck(){

    if (this.commonService.selectedLanguage != this.commonService.lastSelectedLanguage) {
      this.commonService.lastSelectedLanguage = this.commonService.selectedLanguage;
      this.translateService.use(this.commonService.selectedLanguage);
    }   
   
  }


}

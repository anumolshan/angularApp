import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';
import {MenuService} from './app.menu.service';
import {AppComponent} from './app.component';
import {AppMainComponent} from './app.main.component';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from './service/common.service';


@Component({
    /* tslint:disable:component-selector */
    selector: '[app-menuitem]',
    styles: ['.align-Appname { vertical-align: middle; fill: currentColor  }'],
    /* tslint:enable:component-selector */
    template: `
        <ng-container>
            <div *ngIf="root && item.visible !== false" class="layout-menuitem-root-text">

            <span  class="h-3rem app-drawer text-primary align-Appname"  *ngIf="(!appMain.sidebarActive && appMain.isMobile())">
            <svg-icon  src="{{commonService?.appDetails?.icon}}" [stretch]="true" [svgClass]="text-primary" [svgStyle]="{'height.px':20}"></svg-icon>
            </span>

            <span class="ml-2 text-primary"  *ngIf="(!appMain.sidebarActive && appMain.isMobile())"> {{item.label | translate}}</span>

                <i *ngIf="(!appMain.sidebarActive && app.layoutMode !== 'static' && !appMain.isMobile())" class="pi pi-ellipsis-h"></i>
            </div>
            <a [attr.href]="item.url" (click)="itemClick($event)" *ngIf="(!item.routerLink || item.items) && item.visible !== false" (mouseenter)="onMouseEnter()"
               (keydown.enter)="itemClick($event)"
               [attr.target]="item.target" [attr.tabindex]="0" [ngClass]="item.class" pRipple>
                <i>
                <fa-icon [ngClass]="item.icon" [icon]="item.icon"  class="layout-menuitem-icon"></fa-icon>
                </i>
                <span class="menuitem-text">{{item.label | translate}}</span>
                <i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item.items"></i>
                <span class="menuitem-badge" *ngIf="item.badge">{{item.badge}}</span>
            </a>
            <a (click)="itemClick($event)" (mouseenter)="onMouseEnter()" *ngIf="(item.routerLink && !item.items) && item.visible !== false"
               [routerLink]="item.routerLink" routerLinkActive="active-menuitem-routerlink" [ngClass]="item.class" pRipple
               [routerLinkActiveOptions]="{exact: !item.preventExact}" [attr.target]="item.target" [attr.tabindex]="0">
                <i>
                <fa-icon [ngClass]="item.icon" [icon]="item.icon"   class="layout-menuitem-icon"></fa-icon>
                </i>
                <span class="menuitem-text">{{item.label | translate}}</span>
                <i class="pi pi-fw pi-angle-down layout-submenu-toggler" *ngIf="item.items">keyboard_arrow_down</i>
                <span class="menuitem-badge" *ngIf="item.badge">{{item.badge}}</span>
            </a>
            <ul *ngIf="(item.items || active) && item.visible !== false"
                [@children]="(appMain.isHorizontal() && !appMain.isMobile() && root) ? (active ? 'visible' : 'hidden') : (root ? 'visible' :active ? 'visibleAnimated' : 'hiddenAnimated')">
                <ng-template ngFor let-child let-i="index" [ngForOf]="item.items">
                    <li app-menuitem [item]="child" [index]="i" [parentKey]="key" [class]="child.badgeClass"></li>
                </ng-template>
            </ul>
        </ng-container>
    `,
    host: {
        '[class.layout-root-menuitem]': 'root',
        '[class.active-menuitem]': 'active'
    },
    animations: [
        trigger('children', [
            state('void', style({
                height: '0px'
            })),
            state('hiddenAnimated', style({
                height: '0px'
            })),
            state('visibleAnimated', style({
                height: '*'
            })),
            state('visible', style({
                height: '*',
                'z-index': 100
            })),
            state('hidden', style({
                height: '0px',
                'z-index': '*'
            })),
            transition('visibleAnimated => hiddenAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
            transition('hiddenAnimated => visibleAnimated', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
            transition('void => visibleAnimated, visibleAnimated => void',
                animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
        ])
    ]
})
export class AppMenuitemComponent implements OnInit, OnDestroy {

    @Input() item: any;

    @Input() index: number;

    @Input() root: boolean;

    @Input() parentKey: string;

    active = false;

    menuSourceSubscription: Subscription;

    menuResetSubscription: Subscription;

    key: string;

    constructor(public app: AppComponent, public appMain: AppMainComponent, public router: Router, private menuService: MenuService,public translateService: TranslateService,public commonService: CommonService) {
        this.menuSourceSubscription = this.menuService.menuSource$.subscribe(key => {
            // deactivate current active menu
            if (this.active && this.key !== key && key.indexOf(this.key) !== 0) {
                this.active = false;
            }
        });

        this.menuResetSubscription = this.menuService.resetSource$.subscribe(() => {
            this.active = false;
        });

        this.router.events.pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(params => {
                if (this.appMain.isHorizontal()) {
                    this.active = false;
                } else {
                    if (this.item.routerLink) {
                        this.updateActiveStateFromRoute();
                    } else {
                        this.active = false;
                    }
                }
            });
    }

    ngOnInit() {
        if (!this.appMain.isHorizontal() && this.item.routerLink) {
            this.updateActiveStateFromRoute();
        }

        this.key = this.parentKey ? this.parentKey + '-' + this.index : String(this.index);
    }

    updateActiveStateFromRoute() {
        this.active = this.router.isActive(this.item.routerLink[0], !this.item.items && !this.item.preventExact);
    }

    itemClick(event: Event) {
        // avoid processing disabled items
        if (this.item.disabled) {
            event.preventDefault();
            return;
        }

        // navigate with hover in horizontal mode
        if (this.root) {
            this.appMain.menuHoverActive = !this.appMain.menuHoverActive;
        }

        // notify other items
        this.menuService.onMenuStateChange(this.key);

        // execute command
        if (this.item.command) {
            this.item.command({originalEvent: event, item: this.item});
        }

        // toggle active state
        if (this.item.items) {
            this.active = !this.active;
        } else {
            // activate item
            this.active = true;

            // hide overlay menus
            if (this.appMain.isMobile()) {
                this.appMain.sidebarActive = false;
                this.appMain.mobileMenuActive = false;
            }

            // reset horizontal menu
            if (this.appMain.isHorizontal()) {
                this.menuService.reset();
                this.appMain.menuHoverActive = false;
            }
        }
    }

    onMouseEnter() {
        // activate item on hover
        if (this.root && this.appMain.menuHoverActive && this.appMain.isHorizontal() && this.appMain.isDesktop()) {
            this.menuService.onMenuStateChange(this.key);
            this.active = true;
        }
    }

    ngOnDestroy() {
        if (this.menuSourceSubscription) {
            this.menuSourceSubscription.unsubscribe();
        }

        if (this.menuResetSubscription) {
            this.menuResetSubscription.unsubscribe();
        }
    }
}

import {Component, OnInit, OnDestroy} from '@angular/core';
import {AppComponent} from './app.component';
import {AppMainComponent} from './app.main.component';
import {ConfigService} from './demo/service/app.config.service';
import {AppConfig} from './demo/domain/appconfig';
import {Subscription} from 'rxjs';
import axios from 'axios';
import gql from 'graphql-tag';
import { print } from 'graphql';
import awsmobile from 'src/aws-exports';
import { Auth, Storage } from 'aws-amplify';
import { CommonService } from './service/common.service';
@Component({
    selector: 'app-config',
    template: `
        <div class="layout-config" [ngClass]="{'layout-config-active': appMain.configActive}" (click)="appMain.onConfigClick($event)">
            <!-- <a style="cursor: pointer" id="layout-config-button" class="layout-config-button" (click)="onConfigButtonClick($event)">
                <i class="pi pi-cog"></i>
            </a>
            <a style="cursor: pointer" class="layout-config-close" (click)="onConfigCloseClick($event)">
                <i class="pi pi-times"></i>
            </a>
            <div class="layout-config-content">
                <div class="px-3 pt-3">
                    <h5>Theme Customization</h5>
                    <span>Serenity offers different themes for layout, topbar, menu etc.</span>
                </div> -->

                <hr class="mb-0" />

                <div class="layout-config-options p-3">
                    <h6 class="mt-0">Layout Color Mode</h6>
                    <div class="formgroup-inline">
                        <div class="field-radiobutton">
                            <p-radioButton name="layoutColor" value="dark" [(ngModel)]="app.layoutColor" inputId="layoutColor1" (onClick)="onLayoutColorChange($event, 'dark')"></p-radioButton>
                            <label for="layoutColor">Dark</label>
                        </div>
                        <div class="field-radiobutton">
                            <p-radioButton name="layoutColor" value="light" [(ngModel)]="app.layoutColor" inputId="layoutColor2" (onClick)="onLayoutColorChange($event, 'light')"></p-radioButton>
                            <label for="layoutColor2">Light</label>
                        </div>
                    </div>

                    <h6 class="mt-0">Menu Mode</h6>
                    <div class="formgroup-inline">
                        <div class="field-radiobutton">
                            <p-radioButton name="layoutMode" value="overlay" *ngIf="app.layoutMode !== 'static'" [(ngModel)]="app.layoutMode" inputId="mode1"></p-radioButton>
                            <p-radioButton name="layoutMode" value="static" *ngIf="app.layoutMode === 'static'" [(ngModel)]="app.layoutMode" inputId="mode1"></p-radioButton>
                            <label for="mode1">Vertical</label>
                        </div>
                        <div class="field-radiobutton">
                            <p-radioButton name="layoutMode" value="horizontal" [(ngModel)]="app.layoutMode" inputId="mode2"></p-radioButton>
                            <label for="mode2">Horizontal</label>
                        </div>
                    </div>

                    <h6 class="mt-0">Menu Color Mode</h6>
                    <div class="formgroup-inline">
                        <div class="field-radiobutton">
                            <p-radioButton name="darkMenu" [value]="true" [(ngModel)]="app.darkMenu" inputId="darkMenu1"
                                           [disabled]="app.layoutColor === 'dark'" [style]="{'cursor': app.layoutColor === 'dark' ? 'default' : 'pointer'}"></p-radioButton>
                            <label for="darkMenu1">Dark</label>
                        </div>
                        <div class="field-radiobutton">
                            <p-radioButton name="darkMenu" [value]="false" [(ngModel)]="app.darkMenu" inputId="darkMenu2"
                                           [disabled]="app.layoutColor === 'dark'" [style]="{'cursor': app.layoutColor === 'dark' ? 'default' : 'pointer'}"></p-radioButton>
                            <label for="darkMenu2">Light</label>
                        </div>
                    </div>

                    <!-- <h6 class="mt-0">Orientation</h6>
                    <div class="formgroup-inline">
                        <div class="field-radiobutton">
                            <p-radioButton name="isRTL" [value]="false" [(ngModel)]="app.isRTL" inputId="isRTL1"></p-radioButton>
                            <label for="isRTL1">LTR</label>
                        </div>
                        <div class="field-radiobutton">
                            <p-radioButton name="isRTL" [value]="true" [(ngModel)]="app.isRTL" inputId="isRTL2"></p-radioButton>
                            <label for="isRTL2">RTL</label>
                        </div>
                    </div> -->

                    <h6 class="mt-0">Input Style</h6>
                    <div class="formgroup-inline">
                        <div class="field-radiobutton">
                            <p-radioButton name="inputStyle" value="outlined" [(ngModel)]="app.inputStyle"
                                           inputId="inputStyle1"></p-radioButton>
                            <label for="inputStyle1">Outlined</label>
                        </div>
                        <div class="field-radiobutton">
                            <p-radioButton name="inputStyle" value="filled" [(ngModel)]="app.inputStyle" inputId="inputStyle2"></p-radioButton>
                            <label for="inputStyle2">Filled</label>
                        </div>
                    </div>

                    <h6 class="mt-0">Ripple Effect</h6>
                    <p-inputSwitch [ngModel]="app.ripple" (onChange)="appMain.onRippleChange($event)"></p-inputSwitch>

                    <h6>Flat Layouts</h6>
                    <div class="layout-themes">
                        <div *ngFor="let flatLayout of flatLayoutColors">
                            <a style="cursor: pointer" class="flat-layouts" (click)="changeLayout(flatLayout.label)"
                               [ngStyle]="{'background-color': flatLayout.color}">
                                <i class="pi pi-check" *ngIf="layout === flatLayout.label"></i>
                            </a>
                        </div>
                    </div>

                    <h6>Special Layouts</h6>
                    <div class="layout-themes">
                        <div *ngFor="let specialLayout of specialLayoutColors">
                            <a style="cursor: pointer" (click)="changeLayout(specialLayout.label)">
                                <img src="assets/layout/images/configurator/layout/special/{{specialLayout.image}}.png"
                                     [alt]="specialLayout.label"/>
                                <i class="pi pi-check" *ngIf="layout === specialLayout.label"></i>
                            </a>
                        </div>
                    </div>

                    <h6>Component Themes</h6>
                    <div class="layout-themes">
                        <div *ngFor="let theme of themes">
                            <a style="cursor: pointer" class="flat-layouts" (click)="changeTheme(theme.name)"
                               [ngStyle]="{'background-color': theme.color}">
                                <i class="pi pi-check" *ngIf="themeColor === theme.name"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        <!-- </div> -->
    `
})
export class AppConfigComponent implements OnInit, OnDestroy {

    themes: any[];

    themeColor: any="";

    layout: any="";

    flatLayoutColors: any[];

    specialLayoutColors: any[];

    config: AppConfig;

    subscription: Subscription;

    constructor(public app: AppComponent, public appMain: AppMainComponent, public configService: ConfigService,public commonService: CommonService) {
    }

    ngOnInit() {
        let currentTheme = localStorage.getItem('selectedTheme');
        let currentlayout = localStorage.getItem('selectedLayout');
        let LastSelectedTheme = localStorage.getItem('lastSelectedTheme');
        let LastSelectedLayout = localStorage.getItem('lastSelectedLayout');

        if ((currentTheme != null) && (currentlayout != null) && (currentTheme == LastSelectedTheme) && (currentlayout == LastSelectedLayout)) {
            this.layout = localStorage.getItem('selectedLayout')
            this.themeColor = localStorage.getItem('selectedTheme')
            this.setSelectedLayout();
        }
        else {
            this.getProfileDetails();
        }
        this.config = this.configService.config;
        this.subscription = this.configService.configUpdate$.subscribe(config => {
            this.config = config;
        });

        this.flatLayoutColors = [
            {name: 'Amber Pink', label: 'amber', color: '#FFB300'},
            {name: 'Blue Amber', label: 'blue', color: '#1E88E5'},
            {name: 'Blue Grey Green', label: 'bluegrey', color: '#607D8B'},
            {name: 'Brown Cyan', label: 'brown', color: '#795548'},
            {name: 'Cyan Amber', label: 'cyan', color: '#00BCD4'},
            {name: 'Deep Orange Cyan', label: 'deeporange', color: '#F4511E'},
            {name: 'Deep Purple Orange', label: 'deeppurple', color: '#5E35B1'},
            {name: 'Green Brown', label: 'green', color: '#43A047'},
            {name: 'Grey Indigo', label: 'grey', color: '#757575'},
            {name: 'Indigo Pink', label: 'indigo', color: '#3f51b5'},
            {name: 'Light Blue Blue Grey', label: 'lightblue', color: '#03A9F4'},
            {name: 'Light Green Purple', label: 'lightgreen', color: '#7CB342'},
            {name: 'Lime Blue Grey', label: 'lime', color: '#C0CA33'},
            {name: 'Orange Indigo', label: 'orange', color: '#FB8C00'},
            {name: 'Pink Amber', label: 'pink', color: '#D81B60'},
            {name: 'Purple Pink', label: 'purple', color: '#8E24AA'},
            {name: 'Teal Red', label: 'teal', color: '#009688'},
            {name: 'Yellow Teal', label: 'yellow', color: '#FBC02D'},
        ];
        this.specialLayoutColors = [
            {image: 'reflection', label: 'reflection'},
            {image: 'moody', label: 'moody'},
            {image: 'cityscape', label: 'cityscape'},
            {image: 'cloudy', label: 'cloudy'},
            {image: 'storm', label: 'storm'},
            {image: 'palm', label: 'palm'},
            {image: 'flatiron', label: 'flatiron'}
        ];
        this.themes = [
            {name: 'amber', color: '#FFB300'},
            {name: 'blue', color: '#2196F3'},
            {name: 'bluegrey', color: '#607D8B'},
            {name: 'brown', color: '#4E342E'},
            {name: 'cyan', color: '#00BCD4'},
            {name: 'deeppurple', color: '#673AB7'},
            {name: 'deeporange', color: '#FF5722'},
            {name: 'green', color: '#4CAF50'},
            {name: 'grey', color: '#757575'},
            {name: 'indigo', color: '#3F51B5'},
            {name: 'lightblue', color: '#03A9F4'},
            {name: 'lightgreen', color: '#8BC34A'},
            {name: 'lime', color: '#CDDC39'},
            {name: 'orange', color: '#FF9800'},
            {name: 'pink', color: '#E91E63'},
            {name: 'purple', color: '#9C27B0'},
            {name: 'teal', color: '#009688'},
            {name: 'yellow', color: '#FFEB3B'},
        ];
    }

    setSelectedLayout(){
        const layoutLink: HTMLLinkElement = document.getElementById('layout-css') as HTMLLinkElement;
        const layoutHref = 'assets/layout/css/layout-' + this.layout + '.css';
        this.replaceLink(layoutLink, layoutHref);

         const themeLink: HTMLLinkElement = document.getElementById('theme-css') as HTMLLinkElement;
        const themeHref = 'assets/theme/' + this.themeColor + '/theme-' + this.app.layoutColor + '.css';
        this.replaceLink(themeLink, themeHref);

        // const themeLihgtLink: HTMLLinkElement = document.getElementById('theme-css') as HTMLLinkElement;
        // const themeLightHref = 'assets/theme/' + this.themeColor + '/theme-' + this.app.layoutColor + '.css';
        // this.replaceLink(themeLihgtLink, themeLightHref);
    }   

    onLayoutColorChange(event, color) {
        this.app.layoutColor = color;
        this.app.darkMenu = color === 'dark';

        const themeLink = document.getElementById('theme-css');
        const urlTokens = themeLink.getAttribute('href').split('/');
        urlTokens[urlTokens.length - 1] = 'theme-' + this.app.layoutColor + '.css';
        const newURL = urlTokens.join('/');

        this.replaceLink(themeLink, newURL);
        this.configService.updateConfig({...this.config, ...{dark: color.indexOf("light") === -1}});
    }

    changeTheme(theme) {
        this.themeColor = theme;

        const themeLink: HTMLLinkElement = document.getElementById('theme-css') as HTMLLinkElement;
        const themeHref = 'assets/theme/' + theme + '/theme-' + this.app.layoutColor + '.css';
        this.replaceLink(themeLink, themeHref);
    }

    changeLayout(layout) {
        this.layout = layout;

        const layoutLink: HTMLLinkElement = document.getElementById('layout-css') as HTMLLinkElement;
        const layoutHref = 'assets/layout/css/layout-' + layout + '.css';
        this.replaceLink(layoutLink, layoutHref);
    }

    replaceLink(linkElement, href) {
        if (this.isIE()) {
            linkElement.setAttribute('href', href);
        } else {
            const id = linkElement.getAttribute('id');
            const cloneLinkElement = linkElement.cloneNode(true);

            cloneLinkElement.setAttribute('href', href);
            cloneLinkElement.setAttribute('id', id + '-clone');

            linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);

            cloneLinkElement.addEventListener('load', () => {
                linkElement.remove();
                cloneLinkElement.setAttribute('id', id);
            });
        }
    }

    onConfigButtonClick(event) {
        this.appMain.configActive = !this.appMain.configActive;
        event.preventDefault();
    }

    onConfigCloseClick(event) {
        this.appMain.configActive = false;
        event.preventDefault();
    }

    isIE() {
        return /(MSIE|Trident\/|Edge\/)/i.test(window.navigator.userAgent);
    }

    async getProfileDetails() {
        this.commonService.userDetails = (await Auth.currentUserInfo());
        localStorage.setItem('nodeCode',this.commonService.userDetails.attributes["custom:primarynodecode"])

        const SaaSApiGraphQL = gql`
    
        query SaaSApiGraphQL($Id: String!) {
            getClientByid(SK: $Id, PK: $Id) {
              Layout
              Theme             
            }
        } ,`
    
        try {
          const token = (await Auth.currentSession()).getIdToken().getJwtToken();
          const graphqlData = await axios({
            url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_administration_permission,
            method: 'post',
            headers: {
              'Authorization': "Bearer " + token
            },
            data: {
              query: print(SaaSApiGraphQL),
              variables: {
                Id: this.commonService.userDetails.attributes["custom:creatednode"]
              }
            }
          });
          const body = {
            graphqlData: graphqlData.data
          }
        
          
          if (graphqlData.data.data.getClientByid) {
            localStorage.setItem('selectedLayout', graphqlData.data.data.getClientByid.Layout)
            localStorage.setItem('selectedTheme', graphqlData.data.data.getClientByid.Theme)
            this.layout = graphqlData.data.data.getClientByid.Layout;
            this.themeColor = graphqlData.data.data.getClientByid.Theme;       
             this.setSelectedLayout();
          }
         
        } catch (err) {
          console.log('error posting to appsync: ', err);

        }
      }

    ngOnDestroy(){
        if(this.subscription){
            this.subscription.unsubscribe();
        }
    }
}

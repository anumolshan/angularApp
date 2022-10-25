import { Component, Input, OnInit } from '@angular/core';
import { TreeNode, MenuItem, MessageService, ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { CommonService } from 'src/app/service/common.service';
import { TranslateService } from '@ngx-translate/core';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { Router } from '@angular/router';
import { NodeService } from 'src/app/demo/service/nodeservice';
import axios from 'axios';
import gql from 'graphql-tag';
import { print } from 'graphql';
import awsmobile from 'src/aws-exports';
import { Auth } from 'aws-amplify';
import { HelperView } from "../../../shared/helper.view";
import { generate } from 'xksuid'
import { Functionalities } from 'src/app/enum/functionality';

@Component({
  selector: 'app-chart-of-accounts',
  templateUrl: './chart-of-accounts.component.html',
  styleUrls: ['./chart-of-accounts.component.scss']
})
export class ChartOfAccountsComponent implements OnInit {

  searchText: string;
  hierarchyList: TreeNode[];
  items: MenuItem[];
  selectedColumns: any[];
  selectedNode: TreeNode;
  showAccount: boolean = false;
  showGroup: boolean = false;
  access: boolean = false;
  selectedFile: TreeNode;
  showAddPeer: boolean = false;
  showAddSub: boolean = false;
  showAddLeaf: boolean = false;
  accountData: any = {};
  loading: boolean;
  branchName: any;
  selectedView: boolean = false;
  branchDescription: any;
  leafCode: any;
  leafName: any;
  leafCurrency: any;
  leafStatus: boolean;
  leafDescription: any;
  isEditBranchEnable: boolean = false;
  isEditLeafEnable: boolean = false;
  IsDragable: boolean = false;
  accountName: any = {}
  currency: any[];
  IsClicked: boolean = false;
  accountList: any[];
  tempAcountList: any[] = [];
  initialLevel: number = 0;
  isTokenEmpty: boolean = false;
  isShowTabularView: boolean = false;
  constructor(private router: Router, public commonService: CommonService, public translateService: TranslateService, private breadcrumbService: AppBreadcrumbService, private nodeService: NodeService, public messageService: MessageService, public confirmationService: ConfirmationService) {
    this.breadcrumbService.setItems([
      { label: 'settings.pages.chart_of_accounts.breadcrumbs.breadcrumb1',routerLink: '/settings' },
      { label: 'settings.pages.chart_of_accounts.breadcrumbs.breadcrumb2',routerLink: '/settings/chart-accounts' }
    ]);
    this.translateService.setDefaultLang(this.commonService.selectedLanguage);
    this.currency = [
      {
        "code": "PKR",
        "name": "PKR"
      },
      {
        "code": "INR",
        "name": "INR"
      },
      {
        "code": "USD",
        "name": "USD"
      },
      {
        "code": "AED",
        "name": "AED"
      }
    ]
  }

  ngOnInit(): void {
    this.commonService.accessList = Functionalities;

    if (this.commonService.checkItemExist(Functionalities.AddNominalAccount) || this.commonService.checkItemExist(Functionalities.AddSubGrouping) || this.commonService.checkItemExist(Functionalities.EditGrouping) || this.commonService.checkItemExist(Functionalities.RemoveNominalAccount) || this.commonService.checkItemExist(Functionalities.EditNominalAccount) || this.commonService.checkItemExist(Functionalities.RemoveBranch)) {
      localStorage.removeItem('nextToken');  
       this.getListHierarchy();
      if (this.commonService.selectedLanguage != this.commonService.lastSelectedLanguage) {
        this.commonService.lastSelectedLanguage = this.commonService.selectedLanguage;
        this.translateService.use(this.commonService.selectedLanguage);
        this.getMenuData();
      } else {
        this.getMenuData();
        this.translateService.setDefaultLang(this.commonService.selectedLanguage);
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
  getMenuData() {
    this.translateService.get(['settings.pages.chart_of_accounts.add_account_label', 'settings.pages.chart_of_accounts.add_group_label', 'settings.pages.chart_of_accounts.edit_label'])
      .subscribe(translations => {
        this.items = [
          {
            label: 'Add Sub Grouping', icon: 'pi pi-plus',visible: this.commonService.checkItemExist(Functionalities.AddSubGrouping), command: (event) =>
              this.handleBranch('Branch', 'create')
          },
          {
            label: 'Add Nominal Account', icon: 'pi pi-plus',visible: this.commonService.checkItemExist(Functionalities.AddNominalAccount), command: (event) =>
              this.showAddLeaf = true
          },
          {
            label: 'Edit Grouping', icon: 'pi pi-pencil',visible: this.commonService.checkItemExist(Functionalities.EditGrouping), command: (event) =>
              this.handleBranch('Branch', 'edit')

          }
        ];

      });
  }
  selectedItem(value) {
  }

  onLeafSelect(event) {
    if (this.selectedFile.label == "Asset" || this.selectedFile.label == "Liabilities" || this.selectedFile.label == "Equity" || this.selectedFile.label == "Income" || this.selectedFile.label == "Expenses") {
      this.IsDragable = false;
      this.items = [

        {
          label: 'Add Sub Grouping', icon: 'pi pi-plus',visible: this.commonService.checkItemExist(Functionalities.AddSubGrouping), command: (event) =>
            this.handleBranch('Branch', 'create')
        },
        {
          label: 'Add Nominal Account', icon: 'pi pi-plus',visible: this.commonService.checkItemExist(Functionalities.AddNominalAccount), command: (event) =>
            this.showAddLeaf = true
        },
        {
          label: 'Edit Grouping', icon: 'pi pi-pencil',visible: this.commonService.checkItemExist(Functionalities.EditGrouping), command: (event) =>
            this.handleBranch('Branch', 'edit')
        }
      ];
    }



    else if (this.selectedFile && this.selectedFile.children && this.selectedFile.children.length > 0) {

      this.IsDragable = false;
      this.items = [
        {
          label: 'Add Sub Grouping', icon: 'pi pi-plus',visible: this.commonService.checkItemExist(Functionalities.AddSubGrouping), command: (event) =>
            this.handleBranch('Branch', 'create')
        },
        {
          label: 'Add Nominal Account', icon: 'pi pi-plus',visible: this.commonService.checkItemExist(Functionalities.AddNominalAccount), command: (event) =>
            this.showAddLeaf = true
        },
        {
          label: 'Edit Grouping', icon: 'pi pi-pencil',visible: this.commonService.checkItemExist(Functionalities.EditGrouping), command: (event) =>
            this.handleBranch('Branch', 'edit')

        }
      ];
    } else if (this.selectedFile && ((this.selectedFile.children == undefined) || (this.selectedFile.children && this.selectedFile.children.length <= 0)) && this.selectedFile.leaf == false) {
      this.IsDragable = false;
      this.items = [
        {
          label: 'Add Sub Grouping', icon: 'pi pi-plus',visible: this.commonService.checkItemExist(Functionalities.AddSubGrouping), command: (event) =>
            this.handleBranch('Branch', 'create')
        },
        {
          label: 'Add Nominal Account', icon: 'pi pi-plus',visible: this.commonService.checkItemExist(Functionalities.AddNominalAccount), command: (event) =>
            this.showAddLeaf = true
        },
        {
          label: 'Edit Grouping', icon: 'pi pi-pencil',visible: this.commonService.checkItemExist(Functionalities.EditGrouping), command: (event) =>
            this.handleBranch('Branch', 'edit')

        },
        {
          label: 'Remove Branch', icon: 'pi pi-trash',visible: this.commonService.checkItemExist(Functionalities.RemoveBranch), command: (event) =>
            this.confirmDialogForDelete('Branch')
        }
      ];
    } else {
      this.IsDragable = true;
      this.items = [
        {
          label: 'Edit Nominal Account', icon: 'pi pi-pencil',visible: this.commonService.checkItemExist(Functionalities.EditNominalAccount), command: (event) =>
            this.handleLeaf('Branch', 'edit')
        },
        {
          label: 'Remove Nominal Account', icon: 'pi pi-trash',visible: this.commonService.checkItemExist(Functionalities.RemoveNominalAccount), command: (event) =>
            this.confirmDialogForDelete('Account')
        }
      ];
    }
  }

  async getListHierarchy() {
    try {
      this.loading = true;
      const SaaSApiGraphQL = gql`
      query SaaSApiGraphQL($depthBegin: String = "", $depthEnd: String = "", $id: String = "") {
        listHierarchy(depthBegin: $depthBegin, depthEnd: $depthEnd, id: $id) {
          key
          label
          data
          leaf
          collapsedIcon
                      expandedIcon
                      icon
          children {
            key
            label
            data
            leaf
            collapsedIcon
                      expandedIcon
                      icon
            children {
              key
              label
              data
              leaf
              collapsedIcon
                      expandedIcon
                      icon
              children {
                key
                label
                data
                leaf
                collapsedIcon
                      expandedIcon
                      icon
                children {
                  key
                  label
                  data
                  leaf
                  collapsedIcon
                      expandedIcon
                      icon
                  children {
                    key
                    label
                    data
                    leaf
                    collapsedIcon
                      expandedIcon
                      icon
                    children {
                      key
                      label
                      data
                      leaf
                      collapsedIcon
                      expandedIcon
                      icon
                      children {
                        key
                        label
                        data
                        leaf
                        collapsedIcon
                        expandedIcon
                        icon
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      `
      this.clearData();
      const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy;

    const payLoad = {
      "id": "007-honeycomb-ledger-chartofaccounts",
      "depthBegin": "01",
      "depthEnd": "01"
    };

      
      try {
      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);


        // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
        // const graphqlData = await axios({
        //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy,
        //   method: 'post',
        //   headers: {
        //     'Authorization': "Bearer " + token
        //   },
        //   data: {
        //     query: print(SaaSApiGraphQL),
        //     variables: {
        //       "id": "007-honeycomb-ledger-chartofaccounts",
        //       "depthBegin": "01",
        //       "depthEnd": "01"
        //     }
        //   }
        // });
        // const body = {
        //   graphqlData: graphqlData.data
        // }
        var tempFiles = returnResponse.graphqlData.data.listHierarchy;
        const data = [];
        for (const hierarchyObj of tempFiles) {
          if (hierarchyObj.label == "Assets") {
            data[0] = hierarchyObj;
          }
          if (hierarchyObj.label == "Liabilities") {
            data[1] = hierarchyObj;
          }
          if (hierarchyObj.label == "Equity") {
            data[2] = hierarchyObj;
          }
          if (hierarchyObj.label == "Income") {
            data[3] = hierarchyObj;
          }
          if (hierarchyObj.label == "Expenses") {
            data[4] = hierarchyObj;
          }
        }
        this.hierarchyList = data;
        this.hierarchyList = [...this.hierarchyList];
        this.loading = false;
      } catch (err) {
        console.log('error posting to appsync: ', err);
        this.loading = false;
      }
    } catch (error) {
      this.loading = false;
    }

  }

  async nodeExpand(event) {
    if (event.node && !this.searchText) {
      this.loading = true;
      const selectedNodeId = event.node.key.split('#');
      const SaaSApiGraphQL = gql`
      query SaaSApiGraphQL($depthBegin: String = "", $depthEnd: String = "", $id: String = "") {
        listHierarchy(depthBegin: $depthBegin, depthEnd: $depthEnd, id: $id) {
          key
          label
          data
          leaf
          collapsedIcon
                      expandedIcon
                      icon
          children {
            key
            label
            data
            leaf
            collapsedIcon
                      expandedIcon
                      icon
            children {
              key
              label
              data
              leaf
              collapsedIcon
                      expandedIcon
                      icon
              children {
                key
                label
                data
                leaf
                collapsedIcon
                      expandedIcon
                      icon
                children {
                  key
                  label
                  data
                  leaf
                  collapsedIcon
                      expandedIcon
                      icon
                  children {
                    key
                    label
                    data
                    leaf
                    collapsedIcon
                      expandedIcon
                      icon
                    children {
                      key
                      label
                      data
                      leaf
                      collapsedIcon
                      expandedIcon
                      icon
                      children {
                        key
                        label
                        data
                        leaf
                        collapsedIcon
                        expandedIcon
                        icon
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      `
      this.clearData();

      const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy;

    const payLoad = {
      "id": selectedNodeId[0],
            "depthBegin": "01",
            "depthEnd": "03"
    };



    try {

      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
      
        // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
        // const graphqlData = await axios({
        //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy,
        //   method: 'post',
        //   headers: {
        //     'Authorization': "Bearer " + token
        //   },
        //   data: {
        //     query: print(SaaSApiGraphQL),
        //     variables: {
        //       "id": selectedNodeId[0],
        //       "depthBegin": "01",
        //       "depthEnd": "03"
        //     }
        //   }
        // });
        // const body = {
        //   graphqlData: graphqlData.data
        // }
        const extendedData = returnResponse.graphqlData.data.listHierarchy;
        event.node.children = extendedData;
        event.node.children.forEach(node => {
          this.expandRecursive(node, true);
        });
        this.loading = false;
      } catch (err) {
        console.log('error posting to appsync: ', err);
        this.loading = true;
      }


    }
  }

  private expandRecursive(node: TreeNode, isExpand: boolean) {

    if (node.children && this.initialLevel <= 2) {

      node.children.forEach(childNode => {
        this.initialLevel++;

        node.expanded = isExpand;
        this.expandRecursive(childNode, isExpand);

      });
    } else {
      this.initialLevel = 0;
    }

  }

  async createHierarchy(type) {
    if (this.IsClicked == false) {
      if (this.validationCheckForBranch()) {
        this.IsClicked = true;
        let ImmediateParentIdByNode;
        const selectedBranch = this.selectedFile.key.split("#");
        if (type == "Peer") {
          ImmediateParentIdByNode = selectedBranch[1];
        } else {
          ImmediateParentIdByNode = selectedBranch[0];
        }
        this.loading = true;
        const SaaSApiGraphQL = gql`
        mutation SaaSApiGraphQL($ImmediateParentId: String!, $Description: String, $Id: String!, $Name: String!, $Type: String!) {
          createHierarchy(input: {PK: $Id, SK: $Id, Type: $Type, Name: $Name, GSI1PK: $Id, GSI1SK: "00", LSI1: $ImmediateParentId, LSI2: $Type, Description: $Description}) {
            PK
            Type
            Name
            Description
          }
        }
         `
         const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy;

    const payLoad = {
      "Id": generate(),
      "Name": this.branchName,
      "Description": this.branchDescription ? this.branchDescription : "",
      "ImmediateParentId": ImmediateParentIdByNode,
      "Type": "Branch"
    };



    try {

      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);      
          // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
          // const graphqlData = await axios({
          //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy,
          //   method: 'post',
          //   headers: {
          //     'Authorization': "Bearer " + token
          //   },
          //   data: {
          //     query: print(SaaSApiGraphQL),
          //     variables: {
          //       "Id": generate(),
          //       "Name": this.branchName,
          //       "Description": this.branchDescription ? this.branchDescription : "",
          //       "ImmediateParentId": ImmediateParentIdByNode,
          //       "Type": "Branch"
          //     }
          //   }
          // });
          // const body = {
          //   graphqlData: graphqlData.data
          // }

          this.loading = false;
          
          if ((returnResponse.graphqlData.data.createHierarchy != null && returnResponse.graphqlData.data.errors == undefined) && type == "Peer") {
            this.showAddPeer = false;
            this.messageService.add({ severity: 'success', summary: 'Success', detail: "Pear Added Successfully" });
          } else if ((returnResponse.graphqlData.data.createHierarchy != null && returnResponse.graphqlData.data.errors == undefined) && type == "Branch") {
            this.showAddSub = false;
            this.messageService.add({ severity: 'success', summary: 'Success', detail: "Branch Added Successfully" });
          } else {
            this.clearData();
            this.messageService.add({ severity: 'error', summary: 'Error', detail: "Failed to Create" });
          }

          setTimeout(() => {
            this.getListHierarchy();
          }, 2000);
        } catch (err) {
          console.log('error posting to appsync: ', err);
          this.loading = false;
        }
      }
    }

  }
  async createLeaf(type) {


    if (this.IsClicked == false) {
      if (this.validationCheckForAccount()) {
        
        this.IsClicked = true;
        const generatedId = generate();
        const selectedBranch = this.selectedFile.key.split("#");
        const ImmediateParentIdByNode = selectedBranch[0];
               
        
    const tempselectedNodeParentId = await this.getNodeParentId(ImmediateParentIdByNode);
    
    const NodeParentName = tempselectedNodeParentId[0].children[0].label;


        this.loading = true;
        const status = this.leafStatus == true ? 'Active' : 'Inactive'
        const nameForLeaf = this.leafCode + " | " + this.leafName + " | " + this.leafCurrency + " | " + status;
    //     const SaaSApiGraphQL = gql`
    // mutation MyMutation($input: CreateRecordInput!) {
    //   createRecord(input: $input) {
    //     PK
    //   }
    // } `
        const SaaSApiGraphQL = gql`
        mutation MyMutation($input: CreateNominalAccountInput!) {
          createNominalAccount(input: $input) {
            Id
          }
        } `

        const endPoint = awsmobile.aws_appsync_graphqlEndpoint_nominalAccount;

        const payLoad = {
          "input": {
            "PK" : "ACC_"+generatedId,
            "SK" : "ACC_"+generatedId,
            "Description": this.leafDescription ? this.leafDescription : "",
            "GSI1PK" : "ACC_"+generatedId,
            "GSI1SK" : "00",
            "LSI1" : ImmediateParentIdByNode,
            "LSI2" : "Leaf",
            "Code" : this.leafCode,
            "Currency" : this.leafCurrency,
            "Status" : this.leafStatus == true ? true : false,
            "Name" : this.leafName,
            "Type" : "Leaf",
            "MainGroupName" : NodeParentName,
            "ParentName" : this.selectedFile.label
          }
        };
    
    
    
        try {
    
          let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
          // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
          // const graphqlData = await axios({
          //   url: awsmobile.aws_appsync_graphqlEndpoint_nominalAccount,
          //   method: 'post',
          //   headers: {
          //     'Authorization': "Bearer " + token
          //   },
          //   data: {
          //     query: print(SaaSApiGraphQL),
          //     variables: {
          //       "input": {
          //         "PK" : "ACC_"+generatedId,
          //         "SK" : "ACC_"+generatedId,
          //         "Description": this.leafDescription ? this.leafDescription : "",
          //         "GSI1PK" : "ACC_"+generatedId,
          //         "GSI1SK" : "00",
          //         "LSI1" : ImmediateParentIdByNode,
          //         "LSI2" : "Leaf",
          //         "Code" : this.leafCode,
          //         "Currency" : this.leafCurrency,
          //         "Status" : this.leafStatus == true ? true : false,
          //         "Name" : this.leafName,
          //         "Type" : "Leaf",
          //         "MainGroupName" : NodeParentName,
          //         "ParentName" : this.selectedFile.label
          //       }
          //     }
          //   }
          // });

          if ((returnResponse.graphqlData.data !== null && returnResponse.graphqlData.data.errors == undefined)) {
            // await this.createLeafForHierarchy(generatedId, ImmediateParentIdByNode, type);
            this.showAddLeaf = false;
            setTimeout(() => {
              this.clearData();
              this.getListHierarchy();
            }, 2000);
            this.messageService.add({ severity: 'success', summary: 'Success', detail: "Nominal Account Added Successfully" });
            this.loading = false;
          } else {
            this.loading = false;
          
            this.messageService.add({ severity: 'error', summary: 'Error', detail: returnResponse.graphqlData.data.errors[0].message });
           
          }

        

        } catch (err) {
          console.log('error posting to appsync: ', err);
          this.loading = false;
        }
      }
    }
  }
  async createLeafForHierarchy(generatedKsuId, ImmediateParentId, type) {

    const status = this.leafStatus == true ? 'Active' : 'Inactive'
    const generatedId = generatedKsuId;
    const ImmediateParentIdByNode = ImmediateParentId;


    const nameForLeaf = this.leafCode + " | " + this.leafName + " | " + this.leafCurrency + " | " + status;


    const SaaSApiGraphQL = gql`
    mutation SaaSApiGraphQL($ImmediateParentId: String!, $Description: String, $Id: String!, $Name: String!, $Type: String!) {
      createHierarchy(input: {PK: $Id, SK: $Id, Type: $Type, Name: $Name, GSI1PK: $Id, GSI1SK: "00", LSI1: $ImmediateParentId, LSI2: $Type, Description: $Description}) {
        PK
        Type
        Name
        Description
      }
    }
    `

    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy;

    const payLoad = {
      "Id": generatedId,
            "Name": nameForLeaf,
            "Description": this.leafDescription ? this.leafDescription : "",
            "ImmediateParentId": ImmediateParentIdByNode,
            "Type": type
    };



    try {

      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
      // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      // const graphqlData = await axios({
      //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy,
      //   method: 'post',
      //   headers: {
      //     'Authorization': "Bearer " + token
      //   },
      //   data: {
      //     query: print(SaaSApiGraphQL),
      //     variables: {
      //       "Id": generatedId,
      //       "Name": nameForLeaf,
      //       "Description": this.leafDescription ? this.leafDescription : "",
      //       "ImmediateParentId": ImmediateParentIdByNode,
      //       "Type": type
      //     }
      //   }
      // });

      this.loading = false;
      this.showAddLeaf = false;
      
      if ((returnResponse.graphqlData.data.createHierarchy != null && returnResponse.graphqlData.data.errors == undefined)) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Nominal Account Added Successfully" });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Failed to Create" });
      }

      setTimeout(() => {
        this.clearData();
        this.getListHierarchy();
      }, 2000);

    } catch (err) {
      this.loading = false;
      console.log('error posting to appsync: ', err);
    }
  }
  async deleteNode() {

    const selectedBranch = this.selectedFile.key.split("#");
    const selectedNodeId = selectedBranch[0];
    this.loading = true;
    const SaaSApiGraphQL = gql`
    mutation SaaSApiGraphQL($Id: String!) {
      deleteHierarchy(input: {PK: $Id, SK: $Id}) {
        PK
      }
    }`

    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy;

    const payLoad = {
      "Id": selectedNodeId
    };



    try {

      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
      // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      // const graphqlData = await axios({
      //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy,
      //   method: 'post',
      //   headers: {
      //     'Authorization': "Bearer " + token
      //   },
      //   data: {
      //     query: print(SaaSApiGraphQL),
      //     variables: {
      //       "Id": selectedNodeId
      //     }
      //   }
      // });
      // const body = {
      //   graphqlData: graphqlData.data
      // }

      this.loading = false;

      if ((returnResponse.graphqlData.data.deleteHierarchy != undefined || returnResponse.graphqlData.data.deleteHierarchy != null) && returnResponse.graphqlData.data.errors == undefined) {

        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Deleted Successfully" });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Deletion Failed" });
      }
      setTimeout(() => {
        this.clearData();
        this.getListHierarchy();
      }, 2000);
    } catch (err) {
      console.log('error posting to appsync: ', err);
      this.loading = false;
    }
  }
  async upadateBranch() {
    if (this.IsClicked == false) {
      if (this.validationCheckForBranch()) {
        this.IsClicked = true;
        const selectedBranch = this.selectedFile.key.split("#");
        const selectedBranchId = selectedBranch[0];
        const selectedBranchParentId = selectedBranch[1];
        this.loading = true;
        const SaaSApiGraphQL = gql`
    mutation SaaSApiGraphQL($ImmediateParentId: String, $Description: String, $Id: String!, $Name: String, $Type: String) {
      updateHierarchy(input: {PK: $Id, SK: $Id, Type: $Type, Name: $Name, GSI1PK: $Id, GSI1SK: "00", LSI1: $ImmediateParentId,LSI2: $Type, Description: $Description}) {
        PK
        Type
        Name
        Description
        LSI1
      }
    } `

    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy;

    const payLoad = {
      "Id": selectedBranchId,
      "ImmediateParentId": selectedBranchParentId,
      "Name": this.branchName,
      "Description": this.branchDescription ? this.branchDescription : ""
    };



    try {

      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
          // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
          // const graphqlData = await axios({
          //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy,
          //   method: 'post',
          //   headers: {
          //     'Authorization': "Bearer " + token
          //   },
          //   data: {
          //     query: print(SaaSApiGraphQL),
          //     variables: {
          //       "Id": selectedBranchId,
          //       "ImmediateParentId": selectedBranchParentId,
          //       "Name": this.branchName,
          //       "Description": this.branchDescription ? this.branchDescription : ""
          //     }
          //   }
          // });
          // const body = {
          //   graphqlData: graphqlData.data
          // }

          this.loading = false;

          if ((returnResponse.graphqlData.data.updateHierarchy != null && returnResponse.graphqlData.data.errors == undefined)) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: "Updated Successfully" });
          } else {
            this.messageService.add({ severity: 'error', summary: returnResponse.graphqlData.data.errors[0].errorType, detail: returnResponse.graphqlData.data.errors[0].errorType.message });
          }
          this.showAddSub = false;
          setTimeout(() => {
            this.clearData();
            this.getListHierarchy();
          }, 2000);
        } catch (err) {
          console.log('error posting to appsync: ', err);
        }
      }
    }
  }
  async handleBranch(type, action) {

    if (action == 'create') {
      this.showAddSub = true;
      this.isEditBranchEnable = false;
      this.clearData();
    } else {

      const tempSelectedData = await this.getSelectedFile('child');

      this.showAddSub = true;
      this.isEditBranchEnable = true;

      this.branchName = tempSelectedData.Name;
      this.branchDescription = tempSelectedData.Description;
    }

  }
  clearData() {

    this.branchName = "";
    this.branchDescription = "";
    this.leafCode = "";
    this.leafCurrency = "";
    this.leafDescription = "";
    this.leafName = "";
    this.leafStatus = false;
    this.isEditBranchEnable = false;
    this.isEditLeafEnable = false;
    this.IsClicked = false;
  }
  async deleteLeaf() {
    
    const selectedBranch = this.selectedFile.key.split("#");
    const selectedNodeId = selectedBranch[0];
    const leafId = selectedBranch[3];
    this.loading = true;
    const SaaSApiGraphQL = gql`
    mutation MyMutation($input: DeleteNominalAccountInput!) {
      deleteNominalAccount(input: $input) {
        Id
      }
    }
    `

    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_nominalAccount;

    const payLoad = {
      "input": {
        "Id": leafId,
        "PK": selectedNodeId        
      }
    };



    try {

      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
      this.loading = false;
      // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      // const graphqlData = await axios({
      //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger,
      //   method: 'post',
      //   headers: {
      //     'Authorization': "Bearer " + token
      //   },
      //   data: {
      //     query: print(SaaSApiGraphQL),
      //     variables: {
      //       "input": {
      //         "PK": selectedNodeId,
      //         "SK": selectedParentId
      //       }
      //     }
      //   }
      // });
      // const body = {
      //   graphqlData: graphqlData.data
      // }

      // this.deleteLeafhierarchy(selectedNodeId);
      if ((returnResponse.graphqlData.data != null && returnResponse.graphqlData.data.errors == undefined)) {

        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Nominal Account Deleted Successfully" });
        setTimeout(() => {
          this.getListHierarchy();
        }, 2000);
      } else {
        this.clearData();
        this.messageService.add({ severity: 'error', summary: 'Warn', detail: "Nominal Account Deletion Failed" });
      }
    } catch (err) {
      this.loading = false;
      console.log('error posting to appsync: ', err);
    }
  }
  async deleteLeafhierarchy(selectedNodeID) {

    const selectedNodeId = selectedNodeID;

    const SaaSApiGraphQL = gql`
      mutation SaaSApiGraphQL($Id: String!) {
        deleteHierarchy(input: {PK: $Id, SK: $Id}) {
          PK
        }
      }`

      const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy;

      const payLoad = {
        "Id": selectedNodeId
      };
  
  
  
      try {
  
        let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
      // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      // const graphqlData = await axios({
      //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy,
      //   method: 'post',
      //   headers: {
      //     'Authorization': "Bearer " + token
      //   },
      //   data: {
      //     query: print(SaaSApiGraphQL),
      //     variables: {
      //       "Id": selectedNodeId
      //     }

      //   }
      // });
      // const body = {
      //   graphqlData: graphqlData.data
      // }

      this.loading = false;


      if ((returnResponse.graphqlData.data.deleteHierarchy != undefined && returnResponse.graphqlData.data.deleteHierarchy != null)) {

        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Nominal Account Deleted Successfully" });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: "Deletion Failed" });
      }
      setTimeout(() => {
        this.clearData();
        this.getListHierarchy();
      }, 2000);
    } catch (err) {
      this.loading = false;
      console.log('error posting to appsync: ', err);
    }
  }
  async handleLeaf(type, action) {
    if (action == 'create') {
      this.isEditLeafEnable = false;
      this.showAddLeaf = true;
      this.leafName = "";
      this.leafDescription = "";
      this.leafCurrency = "";
      this.leafStatus = false;
      this.leafCode = "";

    } else {


      const selectedLeaf = this.selectedFile.key.split("#");
      const selectedNodeId = selectedLeaf[0];
      const ImmediateParentIdByNode = selectedLeaf[1];
      const tempSelectedData = await this.getSelectedFile('child');

      const selectedLeafData = tempSelectedData.Name.split("|");

      this.showAddLeaf = true;
      this.isEditLeafEnable = true;

      this.leafCode = selectedLeafData[0].trim();
      this.leafName = selectedLeafData[1].trim();
      this.leafCurrency = selectedLeafData[2].trim();
      const status = selectedLeafData[3].trim();
      this.leafStatus = status == 'Active' ? true : false;
      this.leafDescription = this.selectedFile.data;

    }
  }
  async updateLeaf(type) {
    if (this.IsClicked == false) {
      if (this.validationCheckForAccount()) {
        this.IsClicked = true;
        const selectedLeaf = this.selectedFile.key.split("#");

        const parentDetails = await this.getSelectedFile('parent');

        const selectedNodeId = selectedLeaf[0];
        const tempselectedNodeParentId = await this.getNodeParentId(selectedNodeId);
        const NodeParentName = tempselectedNodeParentId[0].children[0].label;
        const ImmediateParentIdByNode = selectedLeaf[1];
        const ledgerId = selectedLeaf[3];
        this.loading = true;
        const status = this.leafStatus == true ? 'Active' : 'Inactive'
        const nameForLeaf = this.leafCode + " | " + this.leafName + " | " + this.leafCurrency + " | " + status;
        const SaaSApiGraphQL = gql`
        mutation MyMutation($input: UpdateNominalAccountInput!) {
          updateNominalAccount(input: $input) {
            Id
          }
        }
         `

    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger;

    const payLoad = {
      // "input": {
      //   "PK": selectedNodeId,
      //   "SK": ImmediateParentIdByNode,
      //   "Name": this.leafName,
      //   "Code": this.leafCode,
      //   "Currency": this.leafCurrency,
      //   "Status": this.leafStatus == true ? true : false,
      //   "Type": "Account",
      //   "Description": this.leafDescription,
      //   "GSI1PK": selectedNodeId,
      //   "GSI1SK": "00",
      //   "LSI1": ImmediateParentIdByNode,
      //   "LSI2": "Account",
      //   "ParentName": parentDetails.Name,
      //   "ParentDescription": parentDetails.Description,
      //   "SearchName": nameForLeaf
      // }

      "input":{ 
        "PK" : selectedNodeId,
        "SK" : selectedNodeId,
        "Description" : this.leafDescription,
        "GSI1PK" : selectedNodeId,
        "GSI1SK" : "00",
        "LSI1" : ImmediateParentIdByNode,
        "LSI2" : "Leaf",
        "Code" : this.leafCode,
        "Currency" : this.leafCurrency,
        "Status" : this.leafStatus == true ? "true" : "false",
        "Name" : this.leafName,
        "Type" : "Leaf",
        "MainGroupName" : NodeParentName,
        "ParentName" :  parentDetails.Name,
        "LedgerId": ledgerId
      }
    };



    try {

      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
          // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
          // const graphqlData = await axios({
          //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger,
          //   method: 'post',
          //   headers: {
          //     'Authorization': "Bearer " + token
          //   },
          //   data: {
          //     query: print(SaaSApiGraphQL),
          //     variables: {
          //       "input": {
          //         "PK": selectedNodeId,
          //         "SK": ImmediateParentIdByNode,
          //         "Name": this.leafName,
          //         "Code": this.leafCode,
          //         "Currency": this.leafCurrency,
          //         "Status": this.leafStatus == true ? true : false,
          //         "Type": "Account",
          //         "Description": this.leafDescription,
          //         "GSI1PK": selectedNodeId,
          //         "GSI1SK": "00",
          //         "LSI1": ImmediateParentIdByNode,
          //         "LSI2": "Account",
          //         "ParentName": parentDetails.Name,
          //         "ParentDescription": parentDetails.Description,
          //         "SearchName": nameForLeaf
          //       }
          //     }
          //   }
          // });
          // const body = {
          //   graphqlData: graphqlData.data
          // }

          if ((returnResponse.graphqlData.data.updateNominalAccount != null && returnResponse.graphqlData.data.errors == undefined)) {
            // await this.updateLeafForHierarchy(selectedNodeId, ImmediateParentIdByNode, type);
            this.messageService.add({ severity: 'success', summary: 'Success', detail: "Nominal Account Updated Successfully" });
            this.showAddLeaf = false;
            setTimeout(() => {
              this.clearData();
              this.getListHierarchy();
            }, 2000);
          } else {

            this.showAddLeaf = false;
            this.messageService.add({ severity: 'error', summary: 'warn', detail: returnResponse.graphqlData.errors[0].message });
            setTimeout(() => {
              this.clearData();
              this.getListHierarchy();
            }, 2000);
          }


        } catch (err) {
          console.log('error posting to appsync: ', err);
          this.loading = false;
        }
      }
    }
  }
  async updateLeafForHierarchy(selectedNodeId, ImmediateParentId, type) {
    const status = this.leafStatus == true ? 'Active' : 'Inactive'
    const selectedNodeID = selectedNodeId;
    const ImmediateParentIdByNode = ImmediateParentId;

    const nameForLeaf = this.leafCode + " | " + this.leafName + " | " + this.leafCurrency + " | " + status;


    const SaaSApiGraphQL = gql`
    mutation SaaSApiGraphQL($ImmediateParentId: String, $Description: String, $Id: String!, $Name: String, $Type: String) {
      updateHierarchy(input: {PK: $Id, SK: $Id, Type: $Type, Name: $Name, GSI1PK: $Id, GSI1SK: "00", LSI1: $ImmediateParentId,LSI2: $Type, Description: $Description}) {
        PK
        Type
        Name
        Description
        LSI1
      }
    }`

    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy;

    const payLoad = {
      "Id": selectedNodeID,
            "Name": nameForLeaf,
            "Description": this.leafDescription,
            "ImmediateParentId": ImmediateParentIdByNode
    };



    try {

      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
      // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      // const graphqlData = await axios({
      //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy,
      //   method: 'post',
      //   headers: {
      //     'Authorization': "Bearer " + token
      //   },
      //   data: {
      //     query: print(SaaSApiGraphQL),
      //     variables: {
      //       "Id": selectedNodeID,
      //       "Name": nameForLeaf,
      //       "Description": this.leafDescription,
      //       "ImmediateParentId": ImmediateParentIdByNode
      //     }
      //   }
      // });
      // const body = {
      //   graphqlData: graphqlData.data
      // }

      this.loading = false;
      this.showAddLeaf = false;

      if ((returnResponse.graphqlData.data.updateHierarchy != null && returnResponse.graphqlData.data.errors == undefined)) {

        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Nominal Account Updated Successfully" });
      }
      setTimeout(() => {
        this.clearData();
        this.getListHierarchy();
      }, 2000);

    } catch (err) {
      this.loading = false;
      console.log('error posting to appsync: ', err);
    }
  }
  checkIsActive(label) {

    const selectedLeafData = label.split("|");
    let status;
    if (selectedLeafData.length > 2) {
       status = selectedLeafData[3].trim();
    } else {
       status = ""
    }
    if (status && status == 'Active') {
      return true;
    } else {
      return false;
    }

  }
  setAccountName(label) {
    const selectedLeafData = label.split("|");
    if (selectedLeafData.length == 1) {
      try {
        this.accountName = {
          code: selectedLeafData[0].trim(),
          name: "",
          currency: "",
          status: ""
        }  
        return true;
  
      } catch (error) {
  
        return false;
  
      }
    } else {
      try {
        this.accountName = {
          code: selectedLeafData[0].trim(),
          name: " - " + selectedLeafData[1].trim(),
          currency: selectedLeafData[2].trim(),
          status: selectedLeafData[3].trim()
        }
  
        return true;
  
      } catch (error) {
  
        return false;
  
      }
    }


  }
  validationCheckForAccount() {
    if (!HelperView.checkStringEmptyOrNull(this.leafCode)) {
      setTimeout(() => document.getElementById("code_id").focus());
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: this.translateService.instant('validations.alert.account_code') });
      return false;
    }
    else if (!HelperView.checkStringEmptyOrNull(this.leafName)) {
      setTimeout(() => document.getElementById("account_name").focus());
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: this.translateService.instant('validations.alert.account_name') });
      return false;
    }
    else if (!HelperView.checkStringEmptyOrNull(this.leafCurrency)) {
      setTimeout(() => document.getElementById("currency").focus());
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: this.translateService.instant('validations.alert.account_currency') });
      return false;
    }

    return true;
  }
  validationCheckForBranch() {

    if (!HelperView.checkStringEmptyOrNull(this.branchName)) {
      setTimeout(() => document.getElementById("group_name").focus());
      this.messageService.add({ severity: 'warn', summary: this.translateService.instant('validations.alert.warn'), detail: this.translateService.instant('validations.alert.account_name') });
      return false;
    }
    return true;
  }
  confirmDialogForDelete(type) {

    this.confirmationService.confirm({
      message: 'Do you want to Remove?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {

        if (type == "Account") {
          this.deleteLeaf();
        } else {
          this.deleteNode();
        }

      },
      reject: () => {
        // this.msgs = [{severity:'info', summary:'Rejected', detail:'You have rejected'}];
      }
    });
  }
  async updateDropedAccount(event) {

    const selectedLeefNode = event.dragNode.key.split("#");
    const dropedLeafNode = event.dropNode.key.split("#");

    const selectedNodeCurrentId = selectedLeefNode[0];
    const selectedNodeParentId = selectedLeefNode[1];

    const ImmediateParentIdByNode = dropedLeafNode[0];

    const tempDragedNodeParentId = await this.getNodeParentId(selectedNodeCurrentId);
    const tempDropedNodeParentId = await this.getNodeParentId(ImmediateParentIdByNode);

    const draggedData = tempDragedNodeParentId[0].children[0].key.split("#");
    const droppedData = tempDropedNodeParentId[0].children[0].key.split("#");

    const dragedNodeParentId = draggedData[0];
    const dropedNodeParentId = droppedData[0];
    this.loading = true;
    if (dragedNodeParentId == dropedNodeParentId) {
      this.IsDragable = true;
      const SaaSApiGraphQL = gql`
      mutation SaaSApiGraphQL($ImmediateParentId: String, $Description: String, $Id: String!, $Name: String, $Type: String) {
        updateHierarchy(input: {PK: $Id, SK: $Id, Type: $Type, Name: $Name, GSI1PK: $Id, GSI1SK: "00", LSI1: $ImmediateParentId,LSI2: $Type, Description: $Description}) {
          PK
          Type
          Name
          Description
          LSI1
        }
      }`

      const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy;

    const payLoad = {
      "Id": selectedNodeCurrentId,
      "ImmediateParentId": ImmediateParentIdByNode
    };



    try {

      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
        // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
        // const graphqlData = await axios({
        //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy,
        //   method: 'post',
        //   headers: {
        //     'Authorization': "Bearer " + token
        //   },
        //   data: {
        //     query: print(SaaSApiGraphQL),
        //     variables: {
        //       "Id": selectedNodeCurrentId,
        //       "ImmediateParentId": ImmediateParentIdByNode
        //     }
        //   }
        // });
        
        this.showAddLeaf = false;

        if ((returnResponse.graphqlData.data.updateHierarchy != null && returnResponse.graphqlData.data.errors == undefined)) {
          this.createDragedAccount(selectedNodeCurrentId, ImmediateParentIdByNode, event);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Warn', detail: "Nominal Account Updatedion Failed" });
          this.loading = false;
          setTimeout(() => {
            this.clearData();
            this.getListHierarchy();
          }, 2000);
        }


      } catch (err) {
        this.loading = false;
        console.log('error posting to appsync: ', err);
      }
    } else {
      this.IsDragable = false;
      this.clearData();
      this.messageService.add({ severity: 'warn', summary: "Warning", detail: "Nominal account cannot be moved from one parent branch to another" });
      setTimeout(() => {
        this.getListHierarchy();
      }, 1000);

    }
  }
  async createDragedAccount(pk, sk, selectedNode) {
    const oldLeafNode = selectedNode.dragNode.key.split("#");

    const oldLeafNodeNodeCurrentId = oldLeafNode[0];
    const oldLeafNodeNodeParentId = oldLeafNode[1];
    const tempselectedNodeParentId = await this.getNodeParentId(sk);
    const NodeParentName = tempselectedNodeParentId[0].children[0].label;

    const selectedRow = selectedNode.dragNode.label.split("|");
    const status = selectedRow[3];
    const leafData = {
      leafCode: selectedRow[0].trim(),
      leafName: selectedRow[1].trim(),
      leafCurrency: selectedRow[2].trim(),
      leafStatus: status == 'Active' ? true : false,
      leafDescription: selectedNode.dragNode.data
    }
    const nameForLeaf = leafData.leafCode + " | " + leafData.leafName + " | " + leafData.leafCurrency + " | " + leafData.leafStatus;
    // const SaaSApiGraphQL = gql`
    //     mutation MyMutation($input: CreateRecordInput!) {
    //       createRecord(input: $input) {
    //         PK
    //       }
    //     } `
    const SaaSApiGraphQL = gql`
    mutation MyMutation($input: CreateNominalAccountInput!) {
      createNominalAccount(input: $input) {
        Id
      }
    } `

    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_nominalAccount;

    const payLoad = {
      "input": {
        "PK" : pk,
        "SK" : pk,
        "Description": leafData.leafDescription ? leafData.leafDescription : "",
        "GSI1PK" : pk,
        "GSI1SK" : "00",
        "LSI1" : sk,
        "LSI2" : "Leaf",
        "Code" : leafData.leafCode,
        "Currency" : leafData.leafCurrency,
        "Status" : leafData.leafStatus == true ? true : false,
        "Name" : leafData.leafName,
        "Type" : "Leaf",
        "MainGroupName" : NodeParentName,
        "ParentName" : selectedNode.dropNode.label
      }
    };



    try {

      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
      // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      // const graphqlData = await axios({
      //   url: awsmobile.aws_appsync_graphqlEndpoint_nominalAccount,
      //   method: 'post',
      //   headers: {
      //     'Authorization': "Bearer " + token
      //   },
      //   data: {
      //     query: print(SaaSApiGraphQL),
      //     variables: {
      //       "input": {
      //         "PK" : pk,
      //         "SK" : pk,
      //         "Description": leafData.leafDescription ? leafData.leafDescription : "",
      //         "GSI1PK" : pk,
      //         "GSI1SK" : "00",
      //         "LSI1" : sk,
      //         "LSI2" : "Leaf",
      //         "Code" : leafData.leafCode,
      //         "Currency" : leafData.leafCurrency,
      //         "Status" : leafData.leafStatus == true ? true : false,
      //         "Name" : leafData.leafName,
      //         "Type" : "Leaf",
      //         "MainGroupName" : NodeParentName,
      //         "ParentName" : selectedNode.dropNode.label
      //       }
      //     }
      //   }
      // });

      if ((returnResponse.graphqlData.data !== null && returnResponse.graphqlData.data.errors == undefined)) {
        await this.deleteteDropedAccount(oldLeafNodeNodeCurrentId, oldLeafNodeNodeParentId);
      } else {
        this.loading = false;
        this.showAddLeaf = false;
        this.messageService.add({ severity: 'error', summary: returnResponse.graphqlData.data.errors[0].errorType, detail: returnResponse.graphqlData.data.errors[0].errorType.message });
        setTimeout(() => {
          this.clearData();
          this.getListHierarchy();
        }, 2000);
      }


    } catch (err) {
      console.log('error posting to appsync: ', err);
      this.loading = false;
    }
  }
  async deleteteDropedAccount(selectedNodeId, ImmediateParentId) {
    const selectedBranch = this.selectedFile.key.split("#");
    const leafId = selectedBranch[3];


    const SaaSApiGraphQL = gql`
    mutation MyMutation($input: DeleteNominalAccountInput!) {
      deleteNominalAccount(input: $input) {
        Id
      }
    }
    `

    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_nominalAccount;

    const payLoad = {
      "input": {
        "Id": leafId,
        "PK": selectedNodeId
        
      }
    };



    try {

      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
      // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      // const graphqlData = await axios({
      //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger,
      //   method: 'post',
      //   headers: {
      //     'Authorization': "Bearer " + token
      //   },
      //   data: {
      //     query: print(SaaSApiGraphQL),
      //     variables: {
      //       "input": {
      //         "PK": selectedNodeId,
      //         "SK": ImmediateParentId
      //       }
      //     }
      //   }
      // });
      // const body = {
      //   graphqlData: graphqlData.data
      // }

      this.loading = false;
      this.showAddLeaf = false;

      if ((returnResponse.graphqlData.data.errors == undefined)) {

        this.messageService.add({ severity: 'success', summary: 'Success', detail: "Nominal Account Updated Successfully" });
      } else {
        this.clearData();
        this.messageService.add({ severity: 'error', summary: 'Warn', detail: "Nominal Account Updatedion Failed" });
      }

    } catch (err) {
      this.loading = false;

      console.log('error posting to appsync: ', err);
    }
  }
  async getSelectedFile(type) {
    const selectedLeaf = this.selectedFile.key.split("#");
    let selectedNodeId;
    if (type == "child") {
      selectedNodeId = selectedLeaf[0];
    } else {
      selectedNodeId = selectedLeaf[1];
    }


    const SaaSApiGraphQL = gql`
    query getHierarchy ($PK: String!, $SK: String!) {
      getHierarchy (PK: $PK, SK: $SK) {
          PK
          SK
          GSI1PK
          GSI1SK
          GSI2PK
          GSI2SK
          LSI1
          LSI2
          LSI3
          Name
          SearchName
          Description
          Type
      }
  }`

  const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy;

  const payLoad = {
    "PK": selectedNodeId,
    "SK": selectedNodeId
  };



  try {

    let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
      // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      // const graphqlData = await axios({
      //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy,
      //   method: 'post',
      //   headers: {
      //     'Authorization': "Bearer " + token
      //   },
      //   data: {
      //     query: print(SaaSApiGraphQL),
      //     variables: {
      //       "PK": selectedNodeId,
      //       "SK": selectedNodeId
      //     }
      //   }
      // });
      // const body = {
      //   graphqlData: graphqlData.data
      // }

      var selectedFile = returnResponse.graphqlData.data.getHierarchy;

      return selectedFile;


    } catch (err) {
      console.log('error posting to appsync: ', err);

    }
  }

  async searchHierarchy(searchText) {
    try {
      const searchData = searchText.trim();
      if (searchData.length >= 3) {
        this.loading = true;

        const SaaSApiGraphQL = gql`
          query MyQuery($Name: String!) {
            queryHierarchiesByName(Name: $Name) {
              key
              label
              data
              icon
              expandedIcon
              collapsedIcon
              leaf
              children {
                key
                label
                data
                icon
                expandedIcon
                collapsedIcon
                leaf
                children {
                  key
                  label
                  data
                  icon
                  expandedIcon
                  collapsedIcon
                  leaf
                  children {
                    key
                    label
                    data
                    icon
                    expandedIcon
                    collapsedIcon
                    leaf
                    children {
                      key
                      label
                      data
                      icon
                      expandedIcon
                      collapsedIcon
                      leaf
                      children {
                        key
                        label
                        data
                        icon
                        expandedIcon
                        collapsedIcon
                        leaf
                        children {
                          key
                          label
                          data
                          icon
                          expandedIcon
                          collapsedIcon
                          leaf
                          children {
                            key
                            label
                            data
                            icon
                            expandedIcon
                            collapsedIcon
                            leaf
                            children {
                              key
                              label
                              data
                              icon
                              expandedIcon
                              collapsedIcon
                              leaf
                              children {
                                key
                                label
                                data
                                icon
                                expandedIcon
                                collapsedIcon
                                leaf
                                children {
                                  key
                                  label
                                  data
                                  icon
                                  expandedIcon
                                  collapsedIcon
                                  leaf
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          `

          const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy;

          const payLoad = {
            "Name": searchData
          };
      
      
      
          try {
      
            let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
          // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
          // const graphqlData = await axios({
          //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy,
          //   method: 'post',
          //   headers: {
          //     'Authorization': "Bearer " + token
          //   },
          //   data: {
          //     query: print(SaaSApiGraphQL),
          //     variables: {
          //       "Name": searchData
          //     }
          //   }
          // });

          // const body = {
          //   graphqlData: graphqlData.data
          // }

          this.hierarchyList = returnResponse.graphqlData.data.queryHierarchiesByName;
          this.loading = false;

        } catch (err) {
          console.log('error posting to appsync: ', err);
          this.loading = false;

        }
      } else {
        this.loading = false;

        this.getListHierarchy();
      }
    } catch (error) {

    }
  }

  clearSearch(type) {
    this.loading = true;
    this.tempAcountList = [];
    this.accountList = [];
    this.searchText = "";
    if (type == 'tree') {
      setTimeout(() => {
        this.getListHierarchy();
        this.loading = false;
      }, 1000);
    } else {
      setTimeout(() => {
        this.getListRecords("clear");
        this.isShowTabularView = true;
        this.loading = false;
      }, 1000);
    }
  }

  async getNodeParentId(id) {

    const SaaSApiGraphQL = gql`
    query MyQuery($PK: String!) {
      queryHierarchiesFromLevel1(PK: $PK) {
        key
        label
        data
        icon
        expandedIcon
        collapsedIcon
        leaf
        children {
          key
          label
          data
          icon
          expandedIcon
          collapsedIcon
          leaf
          children {
            key
            label
            data
            icon
            expandedIcon
            collapsedIcon
            leaf
            children {
              key
              label
              data
              icon
              expandedIcon
              collapsedIcon
              leaf
              children {
                key
                label
                data
                icon
                expandedIcon
                collapsedIcon
                leaf
                children {
                  key
                  label
                  data
                  icon
                  expandedIcon
                  collapsedIcon
                  leaf
                  children {
                    key
                    label
                    data
                    icon
                    expandedIcon
                    collapsedIcon
                    leaf
                    children {
                      key
                      label
                      data
                      icon
                      expandedIcon
                      collapsedIcon
                      leaf
                      children {
                        key
                        label
                        data
                        icon
                        expandedIcon
                        collapsedIcon
                        leaf
                        children {
                          key
                          label
                          data
                          icon
                          expandedIcon
                          collapsedIcon
                          leaf
                          children {
                            key
                            label
                            data
                            icon
                            expandedIcon
                            collapsedIcon
                            leaf
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `

    const endPoint = awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy;

    const payLoad = {
      "PK": id
    };



    try {

      let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
      // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
      // const graphqlData = await axios({
      //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_hierarchy,
      //   method: 'post',
      //   headers: {
      //     'Authorization': "Bearer " + token
      //   },
      //   data: {
      //     query: print(SaaSApiGraphQL),
      //     variables: {
      //       "PK": id
      //     }
      //   }
      // });
      // const body = {
      //   graphqlData: graphqlData.data
      // }

      var selectedFile = returnResponse.graphqlData.data.queryHierarchiesFromLevel1;

      return selectedFile;


    } catch (err) {
      console.log('error posting to appsync: ', err);

    }
  }
  async getListRecords(event) {
    let payLoad;
    if (event == 'clear') {
       payLoad = { 
        "limit": 20,
        "Name": "",
        "offSet": 0
      };
    } else {
       payLoad = { 
        "limit": 20,
        "Name": "",
        "offSet": event.first
      };
    }
    const nextToken = localStorage.getItem('nextToken')
    this.loading = true;
    if (this.selectedView == true && this.isTokenEmpty == false) {
      // const SaaSApiGraphQL = gql`
      // query MyQuery($limit: Int = 10, $nextToken: String) {
      //   listRecords(nextToken: $nextToken, limit: $limit) {
      //     items {
      //       PK
      //       SK
      //       Name
      //       Code
      //       Currency
      //       Status
      //       Type
      //       Description
      //       GSI1PK
      //       GSI1SK
      //       ParentName
      //       ParentDescription
      //     }
      //     nextToken
      //   }
      // }`
      const SaaSApiGraphQL = gql`
      query MyQuery($limit: Int!, $Name: String!, $offSet: Int!) {
        listTabularView(Name: $Name, limit: $limit, offSet: $offSet) {
          body {
            Name
            Description
            Currency
            Code
            ParentName
            Status
          }
        }
      }
      `

      const endPoint = awsmobile.aws_appsync_graphqlEndpoint_nominalAccount;

     
  
  
  
      try {
  
        let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
        // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
        // const graphqlData = await axios({
        //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger,
        //   method: 'post',
        //   headers: {
        //     'Authorization': "Bearer " + token
        //   },
        //   data: {
        //     query: print(SaaSApiGraphQL),
        //     variables: {
        //       "limit": 10,
        //       "nextToken": nextToken ? nextToken : ""
        //     }
        //   }
        // });
        // const body = {
        //   graphqlData: graphqlData.data
        // }
        returnResponse.graphqlData.data.listTabularView.body.forEach(element => {
          this.tempAcountList.push(element);
        });
        this.accountList = this.tempAcountList;
        this.accountList = [...this.accountList];
        // if (returnResponse.graphqlData.data.listRecords.nextToken) {
        //   localStorage.setItem('nextToken', returnResponse.graphqlData.data.listRecords.nextToken);
        // } else {
        //   localStorage.removeItem('nextToken');
        //   this.isTokenEmpty = true;
        // }

      } catch (err) {
        console.log('error posting to appsync: ', err);
        this.loading = false;
      }
      this.loading = false;
    }
    this.loading = false;
  }

  async searchRecords(searchText) {
    try {
      const searchData = searchText.trim();
      if (searchData.length >= 3) {
        this.loading = true;

        // const SaaSApiGraphQL = gql`
        // query MyQuery($limit: Int, $nextToken: String, $SearchName: TableStringFilterInput) {
        //   listRecords(nextToken: $nextToken, limit: $limit, filter: {SearchName: $SearchName}) {
        //     items {
        //       PK
        //       SK
        //       Name
        //       Code
        //       Currency
        //       Status
        //       Type
        //       Description
        //       GSI1PK
        //       GSI1SK
        //       SearchName
        //     }
        //     nextToken
        //   }
        // }`
        const SaaSApiGraphQL = gql`
        query MyQuery($limit: Int!, $Name: String!, $offSet: Int!) {
          listTabularView(Name: $Name, limit: $limit, offSet: $offSet) {
            body {
              Name
              Description
              Currency
              Code
              ParentName
              Status
            }
          }
        }`

        const endPoint = awsmobile.aws_appsync_graphqlEndpoint_nominalAccount;

        const payLoad = {
          // "limit": 500,
          //       "nextToken": "",
          //       "SearchName": { "contains": searchData }
          "limit": 20,
          "Name":  searchData,
          "offSet": 0
        };
    
    
    
        try {
    
          let returnResponse = await this.commonService.apiCallBack(endPoint, SaaSApiGraphQL, payLoad);
          // const token = (await Auth.currentSession()).getIdToken().getJwtToken();
          // const graphqlData = await axios({
          //   url: awsmobile.aws_appsync_graphqlEndpoint_stg_honeycomb_ledger,
          //   method: 'post',
          //   headers: {
          //     'Authorization': "Bearer " + token
          //   },
          //   data: {
          //     query: print(SaaSApiGraphQL),
          //     variables: {
          //       "limit": 500,
          //       "nextToken": "",
          //       "SearchName": { "contains": searchData }
          //     }
          //   }
          // });

          // const body = {
          //   graphqlData: graphqlData.data
          // }

          this.accountList = returnResponse.graphqlData.data.listTabularView.body;
          this.loading = false;

        } catch (err) {
          this.loading = false;

          console.log('error posting to appsync: ', err);

        }
      } else if (this.searchText.length == 0) {
        this.isShowTabularView = true;
        this.getListRecords("clear");
      }
    } catch (error) {
      this.loading = false;
    }
  }

}

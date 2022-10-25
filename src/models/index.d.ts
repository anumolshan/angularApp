import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type UserMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type RoleMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type AppMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type FunctionalityMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type PrivilegeMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type ClientMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class User {
  readonly id: string;
  readonly sub: string;
  readonly accessKey: string;
  readonly secretKey: string;
  readonly profile?: string;
  readonly clientID: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<User, UserMetaData>);
  static copyOf(source: User, mutator: (draft: MutableModel<User, UserMetaData>) => MutableModel<User, UserMetaData> | void): User;
}

export declare class Role {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly sid?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Role, RoleMetaData>);
  static copyOf(source: Role, mutator: (draft: MutableModel<Role, RoleMetaData>) => MutableModel<Role, RoleMetaData> | void): Role;
}

export declare class App {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly icon: string;
  readonly policyName: string;
  readonly Functionalities?: (Functionality | null)[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<App, AppMetaData>);
  static copyOf(source: App, mutator: (draft: MutableModel<App, AppMetaData>) => MutableModel<App, AppMetaData> | void): App;
}

export declare class Functionality {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly isEnabled: boolean;
  readonly resource: string;
  readonly Privileges?: (Privilege | null)[];
  readonly appID: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Functionality, FunctionalityMetaData>);
  static copyOf(source: Functionality, mutator: (draft: MutableModel<Functionality, FunctionalityMetaData>) => MutableModel<Functionality, FunctionalityMetaData> | void): Functionality;
}

export declare class Privilege {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly isEnabled: boolean;
  readonly resource: string;
  readonly functionalitymodelID: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Privilege, PrivilegeMetaData>);
  static copyOf(source: Privilege, mutator: (draft: MutableModel<Privilege, PrivilegeMetaData>) => MutableModel<Privilege, PrivilegeMetaData> | void): Privilege;
}

export declare class Client {
  readonly id: string;
  readonly hqCode: number;
  readonly name: string;
  readonly description?: string;
  readonly profile?: string;
  readonly isEnabled: boolean;
  readonly Users?: (User | null)[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Client, ClientMetaData>);
  static copyOf(source: Client, mutator: (draft: MutableModel<Client, ClientMetaData>) => MutableModel<Client, ClientMetaData> | void): Client;
}
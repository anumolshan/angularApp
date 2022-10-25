// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { User, Role, App, Functionality, Privilege, Client } = initSchema(schema);

export {
  User,
  Role,
  App,
  Functionality,
  Privilege,
  Client
};
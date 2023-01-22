import { DB, Tigris } from '@tigrisdata/core';

const tigrisClient = new Tigris();
const tigrisDb: DB = tigrisClient.getDatabase();

export { tigrisClient, tigrisDb };
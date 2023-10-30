import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

/**
 * Create a global in-memory MongoDB instance and configure the test environment
 * to use it.
 */
export = async function globalSetup() {

  console.log("\n[globalSetup] Starting In-Memory MongoDB instance");

  // it's needed in global space, because we don't want to create a new instance every test-suite
  const instance = await MongoMemoryServer.create({
    binary: {
      version: "7.0.2",
      systemBinary: "/usr/bin/mongod",
    },
    instance: {
      dbName: "kinsend-integration-tests"
    }
  });

  const uri = instance.getUri();
  (global as any).__MONGOINSTANCE = instance;
  process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/')) + '/integrationTests';

  console.log(`[globalSetup] MONGO_URI is ${process.env.MONGO_URI}\n`);

  // The following is to make sure the database is clean before test starts
  await mongoose.connect(`${process.env.MONGO_URI}`);
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();

};

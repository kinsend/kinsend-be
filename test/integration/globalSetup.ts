import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as os from "os";
import * as dotenv from 'dotenv';
const { existsSync, readFileSync } = require('fs')

/**
 * Create a global in-memory MongoDB instance and configure the test environment
 * to use it.
 */
export = async function globalSetup() {

    console.log(`[globalSetup] Starting In-Memory MongoDB instance on ${os.type()} ${os.release()} (${os.platform()})`);

    let instanceConfiguration = {
        binary: {
            version: "7.0.2",
        },
        instance: {
            dbName: "kinsend-integration-tests"
        }
    }

    // MongoDB does not have official binaries for all linux distributions.
    // Sometimes you might need to install the binary locally and point the integration test to it.
    // If you use Ubuntu LTS versions you should be good to go.
    if(process.env.MONGODB_BIN !== "") {
        instanceConfiguration.binary['systemBinary'] = process.env.MONGODB_BIN;
    }

    // check .env file for MONGODB_BIN to avoid having to configure this per every test case.
    if (existsSync('.env')) {
        const envConfig = dotenv.parse(readFileSync('.env'));
        if(envConfig.hasOwnProperty('MONGODB_BIN') && envConfig['MONGODB_BIN'] !== '') {
            instanceConfiguration.binary['systemBinary'] = envConfig['MONGODB_BIN'];
        }
    }


    // it's needed in global space, because we don't want to create a new instance every test-suite
    const instance = await MongoMemoryServer.create(instanceConfiguration);

    const uri = instance.getUri();
    (global as any).__MONGOINSTANCE = instance;
    process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/')) + '/integrationTests';

    console.log(`[globalSetup] MONGO_URI is ${process.env.MONGO_URI}\n`);

    // The following is to make sure the database is clean before test starts
    await mongoose.connect(`${process.env.MONGO_URI}`);
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();

};

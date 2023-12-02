import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as os from "os";
import * as dotenv from 'dotenv';
import { existsSync, readFileSync } from "fs";
import { exec } from "child_process";


/**
 * Create a global in-memory MongoDB instance and configure the test environment
 * to use it.
 */
export = async function globalSetup() {

    let envConfig = {};
    if (existsSync('.env')) {
        envConfig = dotenv.parse(readFileSync('.env'));
    }

    await startDatabase(envConfig);
    await restoreDatabase(envConfig);

    console.log('\n')
};

async function startDatabase(envConfig: object) {

    console.log(`[globalSetup] Preparing In-Memory MongoDB instance on ${os.type()} ${os.release()} (${os.platform()})`);

    let instanceConfiguration = {
        binary: {
            version: "7.0.2",
        },
        instance: {
            dbName: "ks-integration-tests",
            port: 27017
        }
    }

    // MongoDB does not have official binaries for all linux distributions.
    // Sometimes you might need to install the binary locally and point the integration test to it.
    // If you use Ubuntu LTS versions you should be good to go.
    if(process.env.MONGODB_BIN !== "") {
        instanceConfiguration.binary['systemBinary'] = process.env.MONGODB_BIN;
    }

    // check .env file for MONGODB_BIN to avoid having to configure this per every test case.
    if(envConfig.hasOwnProperty('MONGODB_BIN') && envConfig['MONGODB_BIN'] !== '') {
        instanceConfiguration.binary['systemBinary'] = envConfig['MONGODB_BIN'];
    }

    // it's needed in global space, because we don't want to create a new instance every test-suite
    console.log('[globalSetup] Starting In-Memory MongoDB instance')
    const instance = await MongoMemoryServer.create(instanceConfiguration);

    const uri = instance.getUri();
    (global as any).__MONGOINSTANCE = instance;
    process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/')) + '/' + instanceConfiguration.instance.dbName;

    console.log(`[globalSetup] MONGO_URI is ${process.env.MONGO_URI}, attempting connection.`);

    // The following is to make sure the database is clean before test starts
    await mongoose.connect(`${process.env.MONGO_URI}`);
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();

    console.log('[globalSetup] Connection to MongoDB was successful.')

}

async function restoreDatabase(envConfig: {})
{


    let restoreLocation : null|string = null;

    if(envConfig.hasOwnProperty('MONGODB_RESTORE_DB_IT') && envConfig['MONGODB_RESTORE_DB_IT'] !== '') {
        restoreLocation = envConfig['MONGODB_RESTORE_DB_IT'];
    }

    if(restoreLocation === null) {
        return;
    }

    const mongoUri = process.env.MONGO_URI || "";
    const url = [...mongoUri.split("/")].filter((v) => v)
    const fromDB = restoreLocation.substring(restoreLocation.lastIndexOf('/') + 1)
    const toDB = url[2];
    const mongoUriWithoutDB = `${url[0]}//${url[1]}`
    const backupPath = [...restoreLocation.split("/")].slice(0, restoreLocation.split("/").length - 1).join("/")

    const cmd = `mongorestore --stopOnError --uri=${mongoUriWithoutDB} --nsInclude="${fromDB}.*" --nsFrom="${fromDB}.*" --nsTo="${toDB}.*" ${backupPath}`;
    console.log(`[globalSetup] Restoring database using command: ${cmd}`)

    await new Promise<void>((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`${error.message}`);
                reject()
                return;
            }
            if (stderr && error !== null) {
                console.error(`${stderr}`);
                reject()
                return;
            }

            console.log(`${stdout}`);
            resolve();
        });

    });

}

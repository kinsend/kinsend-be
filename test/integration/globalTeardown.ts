import { MongoMemoryServer } from 'mongodb-memory-server';

export = async function globalTeardown() {
    console.log("[globalTeardown] Shutting down In-Memory MongoDB instance.\n");
    const instance: MongoMemoryServer = (global as any).__MONGOINSTANCE;
    await instance.stop();
};
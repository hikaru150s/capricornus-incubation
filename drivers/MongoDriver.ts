import {
  connect,
  Connection,
  ConnectionOptions,
  createConnection,
} from 'mongoose';
import { BaseDriver } from './BaseDriver';

interface IMongoInitOptions {
  options?: ConnectionOptions;
  url: string;
  useMultipleConnection?: boolean;
}

export class MongoDriver extends BaseDriver {

  public constructor() {
    super();
  }
  private connectionBridge: Connection;
  public connection(): Connection {
    return this.connectionBridge;
  }

  public async init(options: IMongoInitOptions = null): Promise<void> {
    if (!options.options) {
      options.options = {};
    }
    options.options.useNewUrlParser = true;
    options.options.useCreateIndex = true;
    options.options.useFindAndModify = false;
    options.options.autoReconnect = true;
    options.options.family = 4;
    if (options && options.url) {
      if (options.useMultipleConnection) {
        this.connectionBridge = await createConnection(options.url, options.options);
      } else {
        await connect(options.url, options.options);
      }
    } else {
      throw new Error('Invalid mongo url');
    }
  }
}

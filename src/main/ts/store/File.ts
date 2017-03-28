import * as fs from "fs";
import * as path from "path";
import Logdown = require("logdown");
import {CryptoboxCRUDStore} from "./CryptoboxCRUDStore";
import {SerialisedRecord} from "./SerialisedRecord";

export default class File extends CryptoboxCRUDStore {
  private logger: Logdown;
  private storagePath: string;

  constructor() {
    super();
    this.logger = new Logdown({alignOutput: true, markdown: false, prefix: "cryptobox.store.File"});
  }

  create(store_name: string, primary_key: string, record: SerialisedRecord) {
    this.logger.log(`Creating record "${primary_key}" in directory "${store_name}"...`, record);
    const file: string = path.normalize(`${this.storagePath}/${store_name}/${primary_key}.txt`);

    return new Promise((resolve, reject) => {
      const base64EncodedData = new Buffer(record.serialised).toString("base64");
      fs.writeFile(file, base64EncodedData, {encoding: "utf8", flag: "w"}, (error) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(file);
        }
      });
    });
  }

  private createDirectory(directory: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.stat(directory, (error) => {
        if (error) {
          if (error.code === "ENOENT") {
            fs.mkdir(directory, (error) => {
              if (error) {
                reject(error);
              } else {
                resolve(directory);
              }
            });
          } else {
            reject(error);
          }
        } else {
          resolve(directory);
        }
      });
    });
  }

  // TODO: Recursive directory creation is not implemented yet.
  init(storagePath: string): Promise<CryptoboxCRUDStore> {
    this.storagePath = path.normalize(storagePath);

    this.logger.log(`Initializing Cryptobox storage in directory "${this.storagePath}"...`);

    return this.createDirectory(this.storagePath)
      .then(() => {
        return this.createDirectory(path.join(this.storagePath, CryptoboxCRUDStore.STORES.PRE_KEYS));
      })
      .then(() => {
        return this.createDirectory(path.join(this.storagePath, CryptoboxCRUDStore.STORES.SESSIONS));
      })
      .then(() => {
        return this.createDirectory(path.join(this.storagePath, CryptoboxCRUDStore.STORES.LOCAL_IDENTITY));
      })
      .then(() => {
        return this;
      });
  }

  read(store_name: string, primary_key: string): Promise<SerialisedRecord> {
    this.logger.log(`Reading record with primary key "${primary_key}" from directory "${store_name}"...`);
    const file: string = path.normalize(`${this.storagePath}/${store_name}/${primary_key}.txt`);

    return new Promise((resolve, reject) => {
      fs.readFile(file, {encoding: "utf8", flag: "r"}, function (error, data) {
        if (error) {
          reject(error);
        } else {
          const decodedData: Buffer = Buffer.from(data, "base64");
          const serialised: ArrayBuffer = new Uint8Array(decodedData).buffer;
          const record: SerialisedRecord = new SerialisedRecord(serialised, CryptoboxCRUDStore.KEYS.LOCAL_IDENTITY);
          resolve(record);
        }
      });
    });
  }

  delete(store_name: string, primary_key: string): Promise<string> {
    this.logger.log(`Deleting record with primary key "${primary_key}" in directory "${store_name}"...`);
    const file: string = path.normalize(`${this.storagePath}/${store_name}/${primary_key}.json`);

    return new Promise((resolve, reject) => {
      fs.unlink(file, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(primary_key);
        }
      });
    });
  }

  delete_all(): Promise<boolean> {
    const directory: string = this.storagePath;

    return new Promise((resolve, reject) => {
      fs.access(directory, error => {
        if (error) {
          return reject(error);
        }
        fs.readdir(directory, (error, files) => {
          if (error) {
            return reject(error);
          }
          Promise.all(files.map((file) => {
            return this.delete(directory, file);
          })).then(() => {
            fs.rmdir(directory, error => {
              if (error) {
                return reject(error);
              }
              resolve();
            });
          }).catch(reject);
        });
      });
    });
  }
}

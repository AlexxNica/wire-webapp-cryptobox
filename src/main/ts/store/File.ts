import * as fs from "fs";
import * as path from "path";
import Logdown = require('logdown');
import {AbstractCryptoboxStore} from "./AbstractCryptoboxStore";
import {SerialisedRecord} from "./SerialisedRecord";

export default class File extends AbstractCryptoboxStore {
  private logger: Logdown;
  private storagePath: string;

  constructor(storagePath: string) {
    super();
    this.storagePath = path.normalize(storagePath);
    this.logger = new Logdown({alignOutput: true, markdown: false, prefix: 'cryptobox.store.File'});
  }

  create(store_name: string, primary_key: string, entity: SerialisedRecord) {
    this.logger.log(`Creating record "${primary_key}" in directory "${store_name}"...`, entity);
    const file: string = path.normalize(`${this.storagePath}/${store_name}/${primary_key}.json`);

    return new Promise((resolve, reject) => {
      fs.writeFile(file, entity.serialised, {encoding: "utf8", flag: "w+"}, (error) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(file);
        }
      });
    });
  }

  read(store_name: string, primary_key: string): Promise<Object> {
    this.logger.log(`Reading record with primary key "${primary_key}" from directory "${store_name}"...`);
    const file: string = path.normalize(`${this.storagePath}/${store_name}/${primary_key}.json`);

    return new Promise((resolve, reject) => {
      fs.readFile(file, {encoding: 'utf8', flag: 'r'}, function (error, data) {
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(data));
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
    const dir = this.storagePath;
    return new Promise((resolve, reject) => {
      fs.access(dir, error => {
        if (error) {
          return reject(error);
        }
        fs.readdir(dir, (error, files) => {
          if (error) {
            return reject(error);
          }
          Promise.all(files.map(function (file) {
            return this.delete(dir, file);
          })).then(() => {
            fs.rmdir(dir, error => {
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

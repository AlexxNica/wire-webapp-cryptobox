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
    this.logger.log(`Saving record "${primary_key}" in directory "${store_name}"...`, entity);
    const file: string = path.normalize(`${this.storagePath}/${store_name}/${primary_key}.txt`);

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
}

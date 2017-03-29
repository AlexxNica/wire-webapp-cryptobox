import * as fs from "fs";
import * as path from "path";
import Logdown = require("logdown");
import {CryptoboxCRUDStore} from "./CryptoboxCRUDStore";
import {RecordNotFoundError} from "./RecordNotFoundError";
import {SerialisedRecord} from "./SerialisedRecord";
import {SerialisedUpdate} from "./SerialisedUpdate";

export default class File extends CryptoboxCRUDStore {
  private logger: Logdown;
  private storagePath: string;

  constructor() {
    super();
    this.logger = new Logdown({alignOutput: true, markdown: false, prefix: "cryptobox.store.File"});
  }

  /**
   * @override
   */
  create(store_name: string, primary_key: string, record: SerialisedRecord): Promise<string> {
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

  /**
   * @override
   */
  update(store_name: string, primary_key: string, changes: SerialisedUpdate): Promise<string> {
    const updatedRecord = new SerialisedRecord(changes.serialised, primary_key);
    return this.create(store_name, primary_key, updatedRecord);
  }

  /**
   * @override
   */
  init(storagePath: string): Promise<CryptoboxCRUDStore> {
    this.storagePath = path.normalize(storagePath);

    this.logger.log(`Initializing Cryptobox storage in directory "${this.storagePath}"...`);

    return this.createDirectory(this.storagePath)
      .then(() => {
        return this.createDirectory(path.join(this.storagePath, CryptoboxCRUDStore.STORES.LOCAL_IDENTITY));
      })
      .then(() => {
        return this.createDirectory(path.join(this.storagePath, CryptoboxCRUDStore.STORES.PRE_KEYS));
      })
      .then(() => {
        return this.createDirectory(path.join(this.storagePath, CryptoboxCRUDStore.STORES.SESSIONS));
      })
      .then(() => {
        return this;
      });
  }

  /**
   * @override
   */
  read(store_name: string, primary_key: string): Promise<SerialisedRecord> {
    this.logger.log(`Reading record with primary key "${primary_key}" from directory "${store_name}"...`);
    const file: string = path.normalize(`${this.storagePath}/${store_name}/${primary_key}.txt`);

    return new Promise((resolve, reject) => {
      fs.readFile(file, {encoding: "utf8", flag: "r"}, function (error, data) {
        if (error) {
          if (error.code === 'ENOENT') {
            const message: string = `Record "${primary_key}" from file "${file}" could not be found.`;
            reject(new RecordNotFoundError(message));
          } else {
            reject(error);
          }
        } else {
          const decodedData: Buffer = Buffer.from(data, "base64");
          const serialised: ArrayBuffer = new Uint8Array(decodedData).buffer;
          const record: SerialisedRecord = new SerialisedRecord(serialised, CryptoboxCRUDStore.KEYS.LOCAL_IDENTITY);
          resolve(record);
        }
      });
    });
  }

  /**
   * @override
   */
  read_all(store_name: string): Promise<SerialisedRecord[]> {
    const directory: string = path.normalize(`${this.storagePath}/${store_name}`);

    return new Promise((resolve) => {
      fs.readdir(directory, (error, files) => {
        const recordNames = files.map((file) => {
          return path.basename(file, path.extname(file));
        });

        const promises = recordNames.map((primary_key) => {
          return this.read(store_name, primary_key);
        });

        Promise.all(promises)
          .then((records: SerialisedRecord[]) => {
            resolve(records);
          });
      });
    });
  }

  /**
   * @override
   */
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

  // TODO: This function fails if the content not only contains files but also subdirectories.
  private deleteDirectoryWithContent(directory: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.access(directory, error => {
        if (error) {
          if (error.code === 'ENOENT') {
            resolve(true);
          } else {
            reject(error);
          }
        } else {
          fs.readdir(directory, (error, files) => {
            if (error) {
              reject(error);
            } else {
              Promise.all(files.map((file) => {
                return fs.unlinkSync(path.join(directory, file));
              })).then(() => {
                fs.rmdir(directory, (error) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(true);
                  }
                });
              }).catch(reject);
            }
          });
        }
      });
    });
  }

  /**
   * @override
   */
  delete_all(): Promise<boolean> {
    const directory: string = this.storagePath;

    return Promise.resolve()
      .then(() => {
        this.deleteDirectoryWithContent(path.join(directory, CryptoboxCRUDStore.STORES.LOCAL_IDENTITY));
      })
      .then(() => {
        this.deleteDirectoryWithContent(path.join(directory, CryptoboxCRUDStore.STORES.PRE_KEYS));
      })
      .then(() => {
        this.deleteDirectoryWithContent(path.join(directory, CryptoboxCRUDStore.STORES.SESSIONS));
      })
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }
}

import * as fs from "fs";
import * as path from "path";
import * as Proteus from "wire-webapp-proteus";
import Logdown = require('logdown');
import {CryptoboxStore} from "./CryptoboxStore";
import {SerialisedRecord} from "./SerialisedRecord";

export default class File implements CryptoboxStore {
  private logger: Logdown;
  private storagePath: string;
  private DIRECTORIES = {
    LOCAL_IDENTITY: "keys",
    PRE_KEYS: "prekeys",
    SESSIONS: "sessions"
  };
  private LOCAL_IDENTITY_KEY: string = "local_identity";

  constructor(storagePath: string) {
    this.storagePath = path.normalize(storagePath);
    this.logger = new Logdown({alignOutput: true, markdown: false, prefix: 'cryptobox.store.IndexedDB'});
  }

  private create(store_name: string, primary_key: string, entity: SerialisedRecord): Promise<string> {
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

  delete_all(): Promise<boolean> {
    return undefined;
  }

  delete_prekey(prekey_id: number): Promise<number> {
    return undefined;
  }

  load_identity(): Promise<Proteus.keys.IdentityKeyPair> {
    return undefined;
  }

  load_prekey(prekey_id: number): Promise<Proteus.keys.PreKey> {
    return undefined;
  }

  load_prekeys(): Promise<Array<Proteus.keys.PreKey>> {
    return undefined;
  }

  save_identity(identity: Proteus.keys.IdentityKeyPair): Promise<Proteus.keys.IdentityKeyPair> {
    const payload: SerialisedRecord = new SerialisedRecord(identity.serialise(), this.LOCAL_IDENTITY_KEY);
    return this.create(this.DIRECTORIES.LOCAL_IDENTITY, this.LOCAL_IDENTITY_KEY, payload)
      .then(() => {
        return identity;
      });
  }

  save_prekey(pre_key: Proteus.keys.PreKey): Promise<Proteus.keys.PreKey> {
    return undefined;
  }

  save_prekeys(pre_keys: Array<Proteus.keys.PreKey>): Promise<Array<Proteus.keys.PreKey>> {
    return undefined;
  }

  create_session(session_id: string, session: Proteus.session.Session): Promise<Proteus.session.Session> {
    const file: string = path.join(this.storagePath, session_id);
    const serializedSession: ArrayBuffer = session.serialise();

    return new Promise((resolve, reject) => {
      fs.writeFile(file, serializedSession, {encoding: "utf8", flag: "w+"}, (error) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(session);
        }
      });
    });
  }

  read_session(identity: Proteus.keys.IdentityKeyPair, session_id: string): Promise<Proteus.session.Session> {
    return undefined;
  }

  update_session(session_id: string, session: Proteus.session.Session): Promise<Proteus.session.Session> {
    return this.create_session(session_id, session);
  }

  delete_session(session_id: string): Promise<string> {
    return undefined;
  }

}

import * as fs from "fs";
import * as path from "path";
import * as Proteus from "wire-webapp-proteus";
import {CryptoboxStore} from "./CryptoboxStore";

export default class File implements CryptoboxStore {
  private storagePath: string;

  constructor(storagePath: string) {
    this.storagePath =  path.normalize(storagePath);
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
    return undefined;
  }

  save_prekey(pre_key: Proteus.keys.PreKey): Promise<Proteus.keys.PreKey> {
    return undefined;
  }

  save_prekeys(pre_keys: Array<Proteus.keys.PreKey>): Promise<Array<Proteus.keys.PreKey>> {
    return undefined;
  }

  create_session(session_id: string, session: Proteus.session.Session): Promise<Proteus.session.Session> {
    const file: string = path.join(this.storagePath, session_id);
    const serializedSession: Buffer = new Buffer(session.serialise());

    return new Promise((resolve, reject) => {
      fs.writeFile(file, serializedSession, {encoding: "utf8", flag: "w+"}, (error) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(session)
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

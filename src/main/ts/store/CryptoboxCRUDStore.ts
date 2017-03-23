import * as Proteus from "wire-webapp-proteus";
import {CryptoboxStore} from "./CryptoboxStore";
import {SerialisedRecord} from "./SerialisedRecord";
import {RecordNotFoundError} from "./RecordNotFoundError";

export abstract class CryptoboxCRUDStore implements CryptoboxStore {
  static get KEYS() {
    return {
      LOCAL_IDENTITY: "local_identity"
    };
  }

  static get STORES() {
    return {
      LOCAL_IDENTITY: "keys",
      PRE_KEYS: "prekeys",
      SESSIONS: "sessions"
    };
  }

  abstract create(store_name: string, primary_key: string, entity: SerialisedRecord): Promise<string>;

  abstract read(store_name: string, primary_key: string): Promise<Object>;

  abstract delete(store_name: string, primary_key: string): Promise<string>;

  abstract delete_all(): Promise<boolean>;

  delete_prekey(prekey_id: number): Promise<number> {
    return this.delete(CryptoboxCRUDStore.STORES.PRE_KEYS, prekey_id.toString())
      .then(() => {
        return prekey_id;
      });
  }

  load_identity(): Promise<Proteus.keys.IdentityKeyPair> {
    return new Promise((resolve, reject) => {
      this.read(CryptoboxCRUDStore.STORES.LOCAL_IDENTITY, CryptoboxCRUDStore.KEYS.LOCAL_IDENTITY)
        .then((record: SerialisedRecord) => {
          const identity: Proteus.keys.IdentityKeyPair = Proteus.keys.IdentityKeyPair.deserialise(record.serialised);
          resolve(identity);
        })
        .catch(function (error: Error) {
          if (error instanceof RecordNotFoundError) {
            resolve(undefined);
          } else {
            reject(error);
          }
        });
    });
  }

  load_prekey(prekey_id: number): Promise<Proteus.keys.PreKey> {
    return undefined;
  }

  load_prekeys(): Promise<Array<Proteus.keys.PreKey>> {
    return undefined;
  }

  save_identity(identity: Proteus.keys.IdentityKeyPair): Promise<Proteus.keys.IdentityKeyPair> {
    const payload: SerialisedRecord = new SerialisedRecord(identity.serialise(), CryptoboxCRUDStore.KEYS.LOCAL_IDENTITY);

    return this.create(CryptoboxCRUDStore.STORES.LOCAL_IDENTITY, payload.id, payload)
      .then(() => {
        return identity;
      });
  }

  save_prekey(pre_key: Proteus.keys.PreKey): Promise<Proteus.keys.PreKey> {
    const payload: SerialisedRecord = new SerialisedRecord(pre_key.serialise(), pre_key.key_id.toString());

    return this.create(CryptoboxCRUDStore.STORES.PRE_KEYS, payload.id, payload)
      .then(() => {
        return pre_key;
      });
  }

  save_prekeys(pre_keys: Array<Proteus.keys.PreKey>): Promise<Array<Proteus.keys.PreKey>> {
    return undefined;
  }

  create_session(session_id: string, session: Proteus.session.Session): Promise<Proteus.session.Session> {
    return undefined;
  }

  read_session(identity: Proteus.keys.IdentityKeyPair, session_id: string): Promise<Proteus.session.Session> {
    return undefined;
  }

  update_session(session_id: string, session: Proteus.session.Session): Promise<Proteus.session.Session> {
    return undefined;
  }

  delete_session(session_id: string): Promise<string> {
    return undefined;
  }
}

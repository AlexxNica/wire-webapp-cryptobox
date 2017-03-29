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

  abstract delete(store_name: string, primary_key: string): Promise<string>;

  abstract delete_all(): Promise<boolean>;

  abstract init(identifier: string): Promise<CryptoboxCRUDStore>;

  abstract read(store_name: string, primary_key: string): Promise<SerialisedRecord>;

  // TODO: Define the format of "Object"!
  abstract update(store_name: string, primary_key: string, changes: any): Promise<string>;

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
    return new Promise((resolve, reject) => {
      this.read(CryptoboxCRUDStore.STORES.PRE_KEYS, prekey_id.toString())
        .then((record: SerialisedRecord) => {
          resolve(Proteus.keys.PreKey.deserialise(record.serialised));
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
    const payload: SerialisedRecord = new SerialisedRecord(session.serialise(), session_id);

    return this.create(CryptoboxCRUDStore.STORES.SESSIONS, payload.id, payload)
      .then(() => {
        return session;
      });
  }

  read_session(identity: Proteus.keys.IdentityKeyPair, session_id: string): Promise<Proteus.session.Session> {
    return this.read(CryptoboxCRUDStore.STORES.SESSIONS, session_id)
      .then((payload: SerialisedRecord) => {
        return Proteus.session.Session.deserialise(identity, payload.serialised);
      });
  }

  update_session(session_id: string, session: Proteus.session.Session): Promise<Proteus.session.Session> {
    const payload: SerialisedRecord = new SerialisedRecord(session.serialise(), session_id);

    return this.update(CryptoboxCRUDStore.STORES.SESSIONS, payload.id, {serialised: payload.serialised})
      .then(() => {
        return session;
      });
  }

  delete_session(session_id: string): Promise<string> {
    return new Promise((resolve) => {
      this.delete(CryptoboxCRUDStore.STORES.SESSIONS, session_id)
        .then((primary_key: string) => {
          resolve(primary_key);
        });
    });
  }
}

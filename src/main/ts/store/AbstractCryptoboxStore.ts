import * as Proteus from "wire-webapp-proteus";
import {CryptoboxStore} from "./CryptoboxStore";
import {SerialisedRecord} from "./SerialisedRecord";

export abstract class AbstractCryptoboxStore implements CryptoboxStore {
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

  abstract create(store_name: string, primary_key: string, entity: SerialisedRecord);

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
    const payload: SerialisedRecord = new SerialisedRecord(identity.serialise(), AbstractCryptoboxStore.KEYS.LOCAL_IDENTITY);

    return this.create(AbstractCryptoboxStore.STORES.LOCAL_IDENTITY, payload.id, payload)
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

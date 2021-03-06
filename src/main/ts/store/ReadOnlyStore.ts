import * as Proteus from "wire-webapp-proteus";
import {CryptoboxStore} from "./CryptoboxStore";

/**
 * This store holds IDs of PreKeys which should be deleted.
 */
export class ReadOnlyStore extends Proteus.session.PreKeyStore {
  public prekeys: Array<number> = [];

  constructor(private store: CryptoboxStore) {
    super();
  }

  /**
   * Releases PreKeys from list. Called when PreKeys have been deleted.
   */
  public release_prekeys(deletedPreKeyIds: Array<number>): void {
    deletedPreKeyIds.forEach((id: number) => {
      let index: number = this.prekeys.indexOf(id);
      if (index > -1) {
        this.prekeys.splice(index, 1);
      }
    });
  }

  /**
   * Returns a PreKey (if it's not marked for deletion) via the Cryptobox store.
   * @override
   */
  get_prekey(prekey_id: number): Promise<Proteus.keys.PreKey> {
    return new Promise((resolve, reject) => {
      if (this.prekeys.indexOf(prekey_id) !== -1) {
        reject(new Error(`PreKey "${prekey_id}" not found.`));
      } else {
        this.store.load_prekey(prekey_id).then(function (pk: Proteus.keys.PreKey) {
          resolve(pk);
        });
      }
    });
  }

  /**
   * Saves the PreKey ID which should get deleted.
   * @override
   */
  remove(prekey_id: number): Promise<number> {
    this.prekeys.push(prekey_id);
    return Promise.resolve(prekey_id);
  }
}

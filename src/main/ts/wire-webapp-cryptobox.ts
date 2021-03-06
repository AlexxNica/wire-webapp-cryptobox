import Cache from "./store/Cache";
import IndexedDB from "./store/IndexedDB";
import {CryptoboxSession} from "./CryptoboxSession";
import {Cryptobox} from "./Cryptobox";
import {DecryptionError} from "./DecryptionError";
import {InvalidPreKeyFormatError} from "./InvalidPreKeyFormatError";
import {ReadOnlyStore} from "./store/ReadOnlyStore";
import {RecordAlreadyExistsError} from "./store/RecordAlreadyExistsError";
import {RecordNotFoundError} from "./store/RecordNotFoundError";

export default {
  Cryptobox: Cryptobox,
  CryptoboxSession: CryptoboxSession,
  DecryptionError: DecryptionError,
  InvalidPreKeyFormatError: InvalidPreKeyFormatError,
  store: {
    Cache,
    IndexedDB,
    ReadOnlyStore,
    RecordAlreadyExistsError,
    RecordNotFoundError
  }
}

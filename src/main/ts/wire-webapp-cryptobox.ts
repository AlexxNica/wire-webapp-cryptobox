import Cache from "./store/Cache";
import File from "./store/File";
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
    File,
    IndexedDB,
    ReadOnlyStore,
    RecordAlreadyExistsError,
    RecordNotFoundError
  }
}

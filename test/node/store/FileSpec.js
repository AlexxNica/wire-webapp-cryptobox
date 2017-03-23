/*
 * Wire
 * Copyright (C) 2016 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

const cryptobox = require('../../../dist/commonjs/wire-webapp-cryptobox');
const fs = require('fs');

// gulp test_node --file "node/store/FileSpec.js"
describe('cryptobox.store.File', () => {
  const testStoragePath = `${__dirname}/test`;
  const id = 'wire/production/062418ea-9b93-4d93-b59b-11aba3f702d8/permanent';
  const cryptoboxPath = `${testStoragePath}/${id}`;

  beforeAll(done => {
    fs.stat(testStoragePath, (error) => {
      if (error) {
        if (error.code === 'ENOENT') {
          fs.mkdir(testStoragePath, (error) => {
            if (error) {
              done.fail(error);
            } else {
              done();
            }
          });
        } else {
          done.fail(error);
        }
      } else {
        done();
      }
    });
  });

  describe('constructor', () => {
    it('constructs a file storage with a given storage path', () => {
      const fileStore = new cryptobox.store.File(cryptoboxPath);
      expect(fileStore.storagePath).toBeDefined();
    });
  });

});

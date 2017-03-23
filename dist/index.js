var cryptobox = require('./commonjs/wire-webapp-cryptobox');
var Logdown = require('logdown');

var fileStore = new cryptobox.store.File();
fileStore.init(__dirname + '/benny')
  .then((fileSto) => {
    return fileSto.delete_all();
  });


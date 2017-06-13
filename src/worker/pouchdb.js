module.exports = require('pouchdb-core')
  .plugin(require('pouchdb-adapter-idb'))
  .plugin(require('pouchdb-adapter-websql'))
  .plugin(require('pouchdb-adapter-http'))
  .plugin(require('pouchdb-upsert'))
  .plugin(require('pouchdb-load'));

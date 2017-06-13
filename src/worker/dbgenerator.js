var fetch = require('isomorphic-fetch')
var PouchDB = require('pouchdb')
var repStream = require('pouchdb-replication-stream')
PouchDB.plugin(repStream.plugin)
PouchDB.adapter('writableStream', repStream.adaptersr.writableStream)
var pouchdbLoad = require('pouchdb-load')
PouchDB.plugin({loadIt: pouchdbLoad.load})
var memdown = require('memdown')
var db = new PouchDB('inmem', {db: memdown})
var bluebird = require('bluebird')
var fs = bluebird.promisifyAll(require('fs'))
var shortRevs = require('short-revs')

var bookDB = new PouchDB('books', {db: memdown})

var NUM_BOOKS = 20;

async function createData() {
    for(var i = 1; i <= NUM_BOOKS; i++) {
        var result = await fetch('http://tekobooks.herokuapp.com/api/book/' + i)
        var json = await result.json();
        json._id = json.id
        await db.put(json)
    }

    var outStream = fs.createWriteStream('../data/books.txt')
    var stream = shortRevs()
    await db.dump(stream)
    stream.pipe(out)
}

createData().catch(console.log.bind(console))

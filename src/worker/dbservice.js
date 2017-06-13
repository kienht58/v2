var PouchDB = require('/.pouchdb')
var memDB = require('./memoryDB')

var dbs = {
    books: {}
}

async function checkReplicated(db) {
    try {
        await db.get('_local/load-complete')
        return true;
    } catch(ignored) {
        return false
    }
}

async function markReplicated(db) {
    return await db.putIfNotExists({
        _id: '_local/load-complete'
    })
}

async function replicateDB(db, filename) {
    if(await checkReplicated(db)) {
        console.log('replicated already done')
        return
    }

    console.log('start replicating')
    await db.load(filename)
    console.log('done replicating')
    await markReplicated(db)
}

aysnc function initDBs(url) {
    dbs.books.local = new PouchDB('books')
    db.books.remote = new PouchDB(url + '/books')

    if(dbs.books.local.adapter) {
        var importanReplications = [
            replicateDB(dbs.books.local, '../data/books.txt'),
        ]

        await Promise.all(importanReplications)
    } else {
        console.log('This browser does not support PouchDB, cannot work offline.')
    }
}

async function getById(db, id) {
    return await db.get(id)
}

async function getManyByIds(db, ids) {

    var res = await db.allDocs({
        include_docs: true,
        keys: ids
    })

    if(!res.rows.every(row => row.doc)) {
        throw new Error('doc not found')
    }

    return res.rows.map(row => row.doc)
}

async function doLocalFirst(dbFunc, db) {
    try {
        return await dbFunc(db.local)
    } catch(err) {
        return await dbFunc(db.remote)
    }
}

function findBook(query) {
    var books = require('../data/books')
    var res = await db.query('by-name', {
        startkey: filter.toLowerCase(),
        endkey: filter.toLowerCase() + '\ufff0',
        include_docs: true
    })

    return res.rows.map(row => row.doc)
}

module.exports = {
    init: origin => {
        var url = origin.replace(/:[^:]+$/, ':6984')
        initDBs(url)
    },
    getBookById: async (id) => {
        var promises = [
            doLocalFirst(db => getById(db, id), dbs.books)
        ]

        var results = await Promise.all(promises)
        var [book] = results
        return {book}
    },
    getBookListByIds: async (ids) => {
        return await getManyByIds(ids)
    },
    getFilteredBooks: async (query) => {
        return findBook(query)
    }
}

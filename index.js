const server = require('express')
const api = server()
const sqlite3 = require('sqlite3')
const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8)

let db = new sqlite3.Database(`${__dirname}/links.db`)
db.run('CREATE TABLE IF NOT EXISTS urls(shorted TEXT, full TEXT, views INTEGER);')
api.get('/shorten', function(req, res) {
    var urlToShorten = req.query.urlToShorten
    var shorted = nanoid()
    db.run(`INSERT INTO urls VALUES("${shorted}", "${urlToShorten}", ${0});`)
    res.status(201).send({
        status: "Created",
        shortedUrl: "http://localhost:3000/" + shorted
    })
})
api.get('/:url', function(req, res) {
    var url = req.params.url
    db.get(`SELECT * FROM urls WHERE shorted = "${url}";`, (err, row) => {
        db.run(`UPDATE urls SET views = ${row.views + 1} WHERE shorted = "${url}";`)
        res.redirect(301, row.full)
    })
})

api.get('/:url/views', function(req, res) {
    var url = req.params.url
    db.get(`SELECT * FROM urls WHERE shorted = "${url}";`, (err, row) => {
        res.status(200).send({
            viewCount: row.views
        })
    })
})

api.listen(3000)
console.log('Server is listening\nhttp://localhost:3000')
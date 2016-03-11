var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('databases/words.sqlite');
db.run("PRAGMA case_sensitive_like = true");
router.get('/', function (req, res, next) {
    var count = 0;
    db.get("SELECT COUNT(*) AS tot FROM words", function (err, row) {
        var respText = "Words API: " + row.tot + " words online.";
        res.send(respText);
    });
});
// We'll implement our API here... module.exports = router;
router.get('/count/:abbrev', function (req, res, next) {
    var abbrev = req.params.abbrev;
    //    var data = {};
    //    var sql = "SELECT COUNT(*) AS wordcount FROM words WHERE word LIKE '" + abbrev + "%'"
    //    db.get(sql, function (err, row) {
    //        data.abbrev = abbrev;
    //        data.count = row.wordcount;
    //        res.send(data);
    //    });
    var alen = abbrev.length;
    var dataArray = [];
    var sql = "SELECT substr(word,1," + alen + "+1) AS abbr, " + " count(*) AS wordcount FROM words " + " WHERE word LIKE '" + abbrev + "%'" + " GROUP BY substr(word,1," + alen + "+1)"
    db.all(sql, function (err, rows) {
        for (var i = 0; i < rows.length; i++) {
            dataArray[i] = {
                abbrev: rows[i].abbr,
                count: rows[i].wordcount
            }
        }
        res.send(dataArray); //Express will stringify data, set Content-type });
    });
});

//router.get('/search/:abbrev', function (req, res, next) {
//    var abbrev = req.params.abbrev;
//    var threshold = req.query.threshold;
//    if (threshold && abbrev.length < Number(threshold)) {
//        res.status(204).send() //204: Success, No Content. 
//        return;
//    }
//    var query = ("SELECT word FROM words " + " WHERE word LIKE '" + abbrev + "%' ORDER BY word ");
//    db.all(query, function (err, data) {
//        if (err) {
//            res.status(500).send("Database Error");
//        } else {
//            res.status(200).json(data);
//        }
//    })
//});

router.get('/search/:abbrev', function (req, res, next) {
    var abbrev = req.params.abbrev;
    var threshold = req.query.threshold || 3;
    // Our default, case-INsensitive query clause:
    var likeClause = "lower(word) LIKE lower('" + abbrev + "%')";
    // Check for query parameter passed by client
    var caseSensitive = req.query.caseSensitive;
    if (caseSensitive === "true") {
        console.log("Case Sensitive");
        // Case-sensitive query:
        likeClause = "word LIKE '" + abbrev + "%'"
    }
    if (threshold && abbrev.length < Number(threshold)) {
        res.status(204).send() //204: Success, No Content.
        return;
    }
    // Use our query clause:
    var query = ("SELECT id, word FROM words " + " WHERE " + likeClause + " ORDER BY word ");
    db.all(query, function (err, data) {
        if (err) {
            res.status(500).send("Database Error");
        } else {
            res.status(200).json(data);
        }
    })
});

router.get('/dictionary/:wordId', function (req, res, next) {
    var wordId = req.params.wordId;
    var query = ("SELECT id, word FROM words " + " WHERE id =" + wordId);
    db.get(query, function (err, data) {
        if (err) {
            res.status(500).send("Database Error");
        } else {
            res.status(200).json(data);
        }
    })
})

router.delete('/dictionary/:wordId', function (req, res, next) {
    var wordId = req.params.wordId;
    var query = ("DELETE FROM words " + " WHERE id =" + wordId);
    db.get(query, function (err, data) {
        if (err) {
            res.status(404).send("Word Doesn't Exist");
        } else {
            res.status(202).send();
        }
    })
})

router.put('dictionary/:wordId', function (req, res, next) {
    var wordId = req.params.wordId;
    var wordChange = req.body.word;
    if (wordChange == null) {
        res.status(404).send("No change found.")
        return;
    }

    var query1 = ("SELECT id, word FROM words " + " WHERE id =" + wordId);
    db.get(query1, function (err, data) {
        if (err) {
            res.status(404).send("Word not Found")
        } else {
            if (data.word == wordChange) {
                res.status(409).send("word isn't different from original")
                return;
            } else {
                var query = ("UPDATE words SET word = '" + wordChange + "' WHERE id =" + wordId);
                db.run(query, function (err, data) {
                    if (err) {
                        res.status(409).send("Database Error");
                    } else {
                        res.status(200).send(data);
                    }
                })
            }
        }
    })
})

router.post('dictionary/', function (req, res, next) {
    var word = req.body.word;
    var wordObj = {};
    var query1 = ("SELECT id, word FROM words " + " WHERE word ='" + word + "'");
    db.get(query1, function (err, data) {
        if (data) {
            if (data.word == word) {
                res.status(303).send("Word already exists")
                return;
            }
        } else {
            var query = ("INSERT INTO words VALUES (null,'" + word + "')");
            db.run(query, function (err, data) {
                if (err) {
                    res.status(409).send("Database Error");
                    return;
                } else {
                    wordObj.id = this.lastId;
                    var newUrl = req.baseUrl + "/dictionary" + wordObj.id;
                    res.set("Location", newUrl);
                    res.status(201).json(wordObj);
                }
            })
        }
    })
})


module.exports = router;
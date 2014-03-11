'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var querystring = require('querystring');
var request = require('request');
var util = require('util');

if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
    };
}


var cfUrl = 'http://games.crossfit.com/lboards/displayLeaderBoard?'; // ?id=432713&numberperpage=60&page=1';

var Scorecard = function(name) {
    this.name = name;
    this.place = 0;
    this.target = false;
    this.rounds = [];
};

Scorecard.prototype.addRound = function(round, position, score) {

    score = score || 0;

    this.rounds.push({
        round: round,
        position: position,
        score: +score
    });
};


function getAverages(data) {

    var avgs = [];

    var chain = _.chain(data)
        .groupBy(function(obj) {
            return obj.round;
        })
        .each(function(obj, index) {

            var avg = _.reduce(obj, function(memo, value) {
                return memo + value.score;
            });

            avgs.push({
                round: index += 1,
                average: avg
            });

        })
        .value();

    console.log(avgs);
}

/**
 * Get the leaderboard and process it.
 */
exports.leaderboard = function(req, res) {

    var roundScores = [];
    var averages = [];

    var boardId = req.body.id;
    var targetName = req.body.name || '';
    targetName = targetName.trim();

    if (!boardId) res.send(500, 'You have not submitted a leaderboard ID.');

    // Build query.
    var scores = [];

    var startPage = 1;

    var queryparams = {
        id: boardId,
        numberperpage: 60
    };
    var qs = '';

    var hasResults = true;

    async.whilst(

        function test() {
            return hasResults;
        },

        function asyncRequest(callback) {

            queryparams.page = startPage;
            qs = querystring.stringify(queryparams);

            request.get(cfUrl + qs, function getScores(error, response, body) {

                if(error) {
                    hasResults = false;
                    callback();
                }

                var $ = cheerio.load(body);

                // All rows but header.
                var rows = $('#lbtable tbody tr').slice(1);

                if (rows.first().children().length <= 2) {
                    hasResults = false;
                    callback();
                }

                
                // Otherwise, has results.

                // Parse rows.
                rows.each(function() {

                    var place = $(this).children('.number').text().split('(')[0];
                    var name = $(this).children('.name').text().trim();

                    var $scoreCells = $(this).children('.score-cell');

                    // Set scorecard.
                    var scorecard = new Scorecard(name);

                    scorecard.place = +(place.trim());

                    // Add rounds.
                    $scoreCells.each(function(i) {

                        var scoreData = $(this).first().text().split('(');
                        var position = scoreData[0].trim();
                        var score = !! scoreData[1] ? Math.abs(scoreData[1].split(')')[0].trim()) : 0;

                        var roundNum = i += 1;

                        scorecard.addRound(roundNum, +position, score);

                        // roundScores.push({
                        //     round: roundNum,
                        //     score: score
                        // });

                    });

                    if (name.toLowerCase() === targetName.toLowerCase()) {
                        scorecard.target = true;
                    }

                    scores.push(scorecard);
                });

                // setTimeout(callback, 2000);

                hasResults = true;
                startPage++;
                callback();

            });

        },

        function asyncCallback(err) {

            res.send(200, scores);

            /*
            var totalScores = scores.length;

            // Calculate round averages.
            _.chain(roundScores)
                .groupBy(function(obj) {
                    return obj.round;
                })
                .each(function(el, index) {

                    var sum = _.reduce(el, function(a, b) {
                        // console.log(a, b);
                        return a + b.score;
                    }, 0);

                    var avg = sum / totalScores;

                    averages.push({
                        round: index,
                        score: sum > 0 ? Math.round(avg * 10) / 10 : '--'
                    });

                });

            // Calculate deviation from average for each score.
            _.each(scores, function(sc, i) {

                _.each(sc.rounds, function(round, j) {

                    if (averages[j].score > 0) {
                        var avgScore = averages[j].score;
                        var deviation = -(avgScore - round.score) / avgScore;
                        round.deviation = Math.round((deviation * 100) * 10) / 10;
                    }

                });

            });

            res.send(200, {
                scores: scores,
                averages: averages
            });
            */
        }
    );

};
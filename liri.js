var keys = require('./keys.js');
var request = require('request');
var inquirer = require('inquirer');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var fs = require('fs');

// User input
var userInput = function() {
    inquirer
        .prompt([
            {
            type: "input",
            message: "Commands:\n- my-tweets\n- spotify-this-song '<song name here>'\n- movie-this '<movie name here>'\n- do-what-it-says\n- exit\nEnter a command: ",
            name: "command"
            }
        ])
        .then(function(response) {
            var inputCommand = response.command;
            var userCommand = inputCommand.substr(0, inputCommand.indexOf(" "));
            checkInput(userCommand, inputCommand);
        });
};

var checkInput = function(userCommand, inputCommand) {
    if (inputCommand === 'my-tweets') {
        myTweets();
    }
    else if (userCommand === 'spotify-this-song') {
        var song = inputCommand.split("spotify-this-song ").pop();
        if (song === '' || song === " ") {
            spotifyThis('ace of base');
        }
        else {
            spotifyThis(song);
        }
    }
    else if (userCommand === 'movie-this') {
        var movie = inputCommand.split("movie-this ").pop();
        if (movie === '' || movie === " ") {
            movieThis('Mr. Nobody');
        }
        else {
            movieThis(movie);
        }
    }
    else if (inputCommand === 'do-what-it-says') {
        doWhatItSays();
    }
    else if (inputCommand === 'exit') {
        return;
    }
    else {
        console.log("Invalid command");
        userInput();
    }

};

// Command: my-tweets
// Show last 20 tweets and when they were created
var myTweets = function() {
    var twitterKey = new Twitter(keys.twitterKeys);
    var params = {
        screen_name: 'TriangleBIZJrnl',
        count: 20
    }
    var queryUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=TriangleBIZJrnl&count=20';

    twitterKey.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (!error) {
            for (var i = 0; i < tweets.length; i++) {
                console.log('\n--------------------------\n');
                console.log(tweets[i].text);
                console.log("Posted: " + tweets[i].created_at);  
            }
        }
    });
};

// Command: spotify-this-song
// Show artist, song name, preview link of the song, album
var spotifyThis = function(song) {
 
    var spotifyKey = new Spotify(keys.spotifyKeys);
    var searchString = '';
    for (var i = 0; i < song.length; i++) {
        if (song[i] === ' ') {
            searchString += '+';
        }
        else {
            searchString += song[i];
        }
    }
    console.log('Search: ' + searchString);
    spotifyKey.search({ type: 'track', query: searchString }, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        var result = data.tracks.items[0];
        console.log('\n--------------------------\n');
        console.log("Song Title: " + result.name);
        console.log("Artist: " + result.artists[0].name);
        console.log("Album: " + result.album.name);
        if (result.preview_url = 'null') {
            console.log("Preview Link: not available");
        }
        else {
            console.log("Preview Link: " + result.preview_url);
        }
        console.log('\n--------------------------\n');
    });
};

// Command: movie-this
// Show title, year, IMDB rating, Rotten Tomatoes rating, country produced, language, plot, actors
var movieThis = function(movie) {
    var searchString = '';
    for (var i = 0; i < movie.length; i++) {
        if (movie[i] === ' ') {
            searchString += '+';
        }
        else {
            searchString += movie[i];
        }
    }
    var queryUrl = "http://www.omdbapi.com/?t=" + searchString + "&y=&plot=short&apikey=40e9cece";

    console.log(queryUrl);

    request(queryUrl, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log('\n--------------------------\n');
            console.log("Title: " + JSON.parse(body).Title);
            console.log("Release Year: " + JSON.parse(body).Year);
            console.log("IMDB Rating: " + JSON.parse(body).Ratings[0].Value);
            console.log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value);
            console.log("Produced In: " + JSON.parse(body).Country);
            console.log("Language: " + JSON.parse(body).Language);
            console.log("Plot: " + JSON.parse(body).Plot);
            console.log("Actors: " + JSON.parse(body).Actors);
            console.log('\n--------------------------\n');
        }
    });
};

// Command: do-what-it-says
// Use fs Node package to call on of LIRI's commands with text inside random.txt
var doWhatItSays = function() {
    fs.readFile("random.txt", "utf8", function(error, data) {
        console.log("TXT: " + data);
        var inputCommand = data;
        var userCommand = inputCommand.substr(0, inputCommand.indexOf(" "));
        console.log('inputCommand: ' + inputCommand);
        console.log ('userCommand: ' + userCommand);    
        if (error) {
            return console.log(error);
        }
        checkInput(userCommand, inputCommand);    
    });
};

userInput();
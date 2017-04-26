// Note to self:  See this for liri related to this exercisehttps://www.npmjs.com/package/liri
// Add variables for request, twitter, spotify and to link ot twitter keys in keys.js file
var keys = require("./keys");
var twitter = require("twitter");
var myTwitter = new twitter(keys.twitterKeys);
var spotify = require("spotify");
var request = require("request");
var fs = require("fs");
// Note to self: Keep inquirer -- might decide to use thius
// var inquirer = require("inquirer")

// set up arguments in array relating to inputs
var command = process.argv[2];
var input = process.argv[3];
var log = command + ", " + input + ": ";

//stuff to view in terminal
function printScreen(obj) {
    for (key in obj) {
        console.log(key + ": " + obj[key])
    }
}
// Note to self:  This is where you got the switch-case info: https://www.w3schools.com/js/js_switch.asp
function liriGo() {
    switch (command) {
        case "my-tweets":
            myTweets();
            break;
        case "spotify-this-song":
            spotifyThis(input);
            break;
        case "movie-this":
            movies(input)
            break;
        case "do-what-it-says":
            doWhatSays();
            break;
    }
}
// Note to self: Use "apendFile" to avoid writing over log.txt file. See 04-19-2017-Content Class Exercise Files for  fs read, write, append file and bank.js exercise
function logMe(object) {
    var input = JSON.stringify(object, null, 2);

    fs.appendFile("./log.txt", log + input + "\n", "utf8", function(error) {
        if (error) {
            console.log("Log.txt Error!")
        } else {
            console.log("Results logged to log.txt file!")
        }
    })
}

// Info about songs from Spotify.
// Note to self: These methods come from npm module documentation. For API info and use See https://developer.spotify.com/web-api/user-guide/  for npm module queries use https://www.npmjs.com/package/spotify rather than usual AJAX
function spotifySong(artist, song, link, album) {
    this.Artist = artist,
        this.Song = song,
        this.Link = link,
        this.Album = album
}

function spotifyThis(song) {
    var songIndex = 0;

    //Default song, if none is entered
    if (!song) {
        // console.log(JSON.stringify(data, null, 2))
        // default to Ace of Base;
        song = "The Sign",
            songIndex = 7;
    };

    spotify.search({
            type: 'track',
            query: song
        },
        function(err, data) {
            if (err) {
                console.log('Error occurred: ' + err);
                return;
            }

            //Grab only the first result
            var result = data.tracks.items[songIndex];

            //Grabs all artists
            var artist = [];
            for (var i = 0; i < result.artists.length; i++) {
                artist.push(result.artists[i].name);
            }
            artist = artist.join(", ");

            //Grabs song, link and album info
            var song = result.name;
            var link = result.preview_url;
            var album = result.album.name;

            //Stores everything in a new object, to be added to  log.txt
            var songObj = new spotifySong(artist, song, link, album);

            printScreen(songObj);
            logMe(songObj);
        })
}

//Note to self:  I went here to get proper sytax https://www.npmjs.com/package/twitter
function myTweets() {
    //Grabs my twitter feed, up to 20 tweets
    myTwitter.get("search/tweets", {
        q: "ChipChipf42",
        limit: 20
    }, function(error, tweets, response) {
        //Loops through all returned tweets, and prints the Tweet's text and time sent
        var tw = tweets.statuses
        var tweetObj = new Object();
        for (var i = 0; i < tw.length; i++) {
            var key = tw[i].created_at;
            var text = "'" + tw[i].text + "'";
            tweetObj[key] = text;
        }

        printScreen(tweetObj);
        logMe(tweetObj);
    })
}


//Search movies OMDB -- get this:
// * Title of the movie.
// * Year the movie came out.
// * IMDB Rating of the movie.
// * Country where the movie was produced.
// * Language of the movie.
// * Plot of the movie.
// * Actors in the movie.
// * Rotten Tomatoes URL.  Not working.

// Note to self; To fix, see https://www.w3schools.com/jsref/jsref_switch.asp


function movieAdded(title, year, rating, country, language, plot, actors, tomatoURL) {
    this.Title = title,
        this.Year = year,
        this.Rating = rating,
        this.Country = country,
        this.Language = language,
        this.Plot = plot,
        this.Actors = actors,
        this.TomatoURL = tomatoURL
    // I couldn't figure out how to get to the exact movie URL

}
//Note to self: Reserve this:  request("http://www.omdbapi.com/?t=" + movieInput +"&y=&plot=long&tomatoes=true&r=json", function(error, response, body. //
// Note to instructor -- I had this working until I put in the Mr Nobody default -- so, the Mr. Nobody default works, but the query returns nothing for the input "___"

function movies(input) {
    var movieSearch = "http://www.omdbapi.com/?t=&y=&plot=short&tomatoes=true&r=json";
    var MrNoBody = 'http://www.omdbapi.com/?t=Mr.+Nobody&y=&plot=short&tomatoes=true&r=json';
    if (input === undefined) {
        request(MrNoBody, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var movie = JSON.parse(body);
                var pictureObj = new movieAdded(movie.Title, movie.Year, movie.Rated, movie.Country, movie.Language, movie.Plot, movie.Actors, movie.TomatoURL);
                printScreen(pictureObj);
                logMe(pictureObj);
            } else {
                if (input === "") {
                    request(movieSearch, function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var movie = JSON.parse(body);
                            var pictureObj = new movieAdded(movie.Title, movie.Year, movie.Rated, movie.Country, movie.Language, movie.Plot, movie.Actors, movie.TomatoURL);
                            printScreen(pictureObj);
                            logMe(pictureObj);
                        }
                    });
                }
            }
        });
    }
}


// Read from random.txt file
function doWhatSays() {
    fs.readFile("./random.txt", "utf8", function(error, data) {
        if (!error) {
            var comma = data.indexOf(",");
            command = data.slice(0, comma);
            input = data.slice(comma + 1);
            liriGo()
        }
    })
}
// execute
liriGo();

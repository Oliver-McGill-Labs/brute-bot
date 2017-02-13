// START HEROKU SETUP
var express = require("express");
var app = express();
app.get('/', function(req, res){ res.send('The robot is happily running.'); });
app.listen(process.env.PORT || 5000);
// END HEROKU SETUP


var TwitterPackage = require('twitter');
var random = require("random-js")();
var KEYS = require('./env/api_keys')

var config = {
  me: 'TxLegeFactBot', // The authorized account with a list to retweet.
  myList: 'txlegelist', // The list we want to retweet.
  regexFilter: '', // Accept only tweets matching this regex pattern.
  regexReject: '(RT|@)' // AND reject any tweets matching this regex pattern.
}


var secret = {
  consumer_key: KEYS.consumer_key || process.env.consumer_key,
  consumer_secret: KEYS.consumer_secret || process.env.consumer_secret,
  access_token_key: KEYS.access_token_key || process.env.access_token_key,
  access_token_secret: KEYS.access_token_secret || process.env.access_token_secret
  };
  
var Twitter = new TwitterPackage(secret);

//-----------------------------------------------------------------------
// List retweeter

// Get the members of our list, and pass them into a callback function.
function getListMembers(callback) {
    var memberIDs = [];

    tu.listMembers({owner_screen_name: config.me,
        slug: config.myList
    },
    function(error, data){
        if (!error) {
            for (var i=0; i < data.users.length; i++) {
                memberIDs.push(data.users[i].id_str);
            }

            // This callback is designed to run listen(memberIDs).
            callback(memberIDs);
        } else {
            console.log(error);
            console.log(data);
        }
    });
}

// What to do after we retweet something.
function onReTweet(err) {
    if(err) {
        console.error("retweeting failed :(");
        console.error(err);
    }
}

// What to do when we get a tweet.
function onTweet(tweet) {
    // Reject the tweet if:
    //  1. it's flagged as a retweet
    //  2. it matches our regex rejection criteria
    //  3. it doesn't match our regex acceptance filter
    var regexReject = new RegExp(config.regexReject, 'i');
    var regexFilter = new RegExp(config.regexFilter, 'i');
    if (tweet.retweeted) {
        return;
    }
    if (config.regexReject !== '' && regexReject.test(tweet.text)) {
        return;
    }
    if (regexFilter.test(tweet.text)) {
        console.log(tweet);
        console.log("RT: " + tweet.text);
        // Note we're using the id_str property since javascript is not accurate
        // for 64bit ints.
        tu.retweet({
            id: tweet.id_str
        }, onReTweet);
    }
}

// Function for listening to twitter streams and retweeting on demand.
function listen(listMembers) {
    tu.filter({
        follow: listMembers
    }, function(stream) {
        console.log("[retweetBot] listening to stream");
        stream.on('tweet', onTweet);
    });
}

// The application itself.
// Use the tuiter node module to get access to twitter.
var tu = require('tuiter')(secret);

// Run the application. The callback in getListMembers ensures we get our list
// of twitter streams before we attempt to listen to them via the twitter API.
getListMembers(listen);

//-----------------------------------------------------------------------
// Follow reply

var stream = Twitter.stream('user');
// Anytime someone follows me
stream.on('follow', followed);
  
  // Just looking at the event but I could tweet back!
function followed(event) {
  console.log('Follow Event is running');
  //get their twitter handler (screen name)
  var name = event.source.name,
  screenName = event.source.screen_name;
  if (screenName === 'TXLegeFactBot' || name === 'TX Lege Fact') {
    console.log('You can\'t follow yourself, Bot.')
  } else {
    console.log('I was followed by: ' + name + ' ' + screenName);
    // function that replies back to the user who followed
    tweetNow('@' + screenName + ' Thank you for the follow. Find your rep with this tool: https://goo.gl/KNcqxU');
  }
}

// function definition to tweet back to user who followed
function tweetNow(tweetTxt) {  
  var tweet = {
      status: tweetTxt
  }
  Twitter.post('statuses/update', tweet, function(err, data, response) {
    if(err){
      console.log("Error in Replying");
    }
    else{
      console.log("Gratitude shown successfully");
    }
  });
}

// Tweet Liker BOT====================

// find a random tweet and 'favorite' it
var favoriteTweet = function(){  
  var params = {
      q: '#txlege' || '#SB4' || '#NoBanNoWall' || '#resist' || '#HereToStay' || '@KenPaxtonTX' || '@JohnCornyn' || '@TedCruz' || '@MillerForTX' || '@DrBuckingham' || '@DrSchwertner' || '@RepMattKrause' || '@KyleBiedermann' || '@DanPatrick' || '@RepMcCaul' || '@GovAbbott', // REQUIRED
      result_type: 'recent',
      lang: 'en'
  }
  // find the tweet
  Twitter.get('search/tweets', params, function(err,data){

    if(err) {
        console.log('Error with finding the tweet to favorite');
    } else {
    // find tweets
    var tweet = data.statuses;
    var randomTweet = ranDom(tweet);   // pick a random tweet

    // if random tweet exists
    if(typeof randomTweet != 'undefined'){
      // Tell TWITTER to 'favorite'
      Twitter.post('favorites/create', {id: randomTweet.id_str}, function(err, response){
        // if there was an error while 'favorite'
        if(err){
          console.log('unable to like');
        }
        else{
          console.log('I liked a tweet!');
        }
      });
    }
    }
  });
}
// grab & 'favorite' as soon as program is running...
favoriteTweet();  
// 'favorite' a tweet in every ______ interval
setInterval(favoriteTweet, 10000);

// function to generate a random tweet tweet
function ranDom (arr) {  
  var index = Math.floor(Math.random()*arr.length);
  return arr[index];
};
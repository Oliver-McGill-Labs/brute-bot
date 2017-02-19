// SIMPLE EXPRESS SERVER IF DEPLOYING TO HEROKU
var express = require("express");
var app = express();
app.get('/', function(req, res){ res.send('Brute-bot is running.'); });
app.listen(process.env.PORT || 5000);
// END HEROKU SETUP

var TwitterPackage = require('twitter');
var random = require("random-js")();
var KEYS = require('./env/api_keys')

var config = {
  me: '<MY-ACCOUNT-HANDLE-HERE>', // The authorized account with a list to retweet.
  myList: 'MY-LIST-HERE', // The list we want to retweet.
  regexFilter: '', // Accept only tweets matching this regex pattern.
  regexReject: '(RT|@)' // AND reject any tweets matching this regex pattern.
}


// If deploying to Heroku, add API keys to Settings > Config Vars
var secret = {
  consumer_key: KEYS.consumer_key || process.env.consumer_key,
  consumer_secret: KEYS.consumer_secret || process.env.consumer_secret,
  access_token_key: KEYS.access_token_key || process.env.access_token_key,
  access_token_secret: KEYS.access_token_secret || process.env.access_token_secret
  };
  
var Twitter = new TwitterPackage(secret);

//-----------------------------------------------------------------------
// List retweeter - BruteBot can retweet a member of a list whenever they tweet

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
        console.log("[brutebotRetweet] listening to stream");
        stream.on('tweet', onTweet);
    });
}

// The application itself.
// BruteBot uses the tuiter node module to get access to twitter for this portion of functionality.
var tu = require('tuiter')(secret);

// Run the application. The callback in getListMembers ensures we get our list
// of twitter streams before we attempt to listen to them via the twitter API.
getListMembers(listen);

//-----------------------------------------------------------------------
// Follow reply - replies to someone whenever they follow

var stream = Twitter.stream('user');
// Anytime someone follows me
stream.on('follow', followed);
  
  // Just looking at the event but I could tweet back!
function followed(event) {
  console.log('Follow Event is running');
  //get their twitter handler (screen name)
  var name = event.source.name,
  screenName = event.source.screen_name;
  if (screenName === '<MY-ACCOUNT-HANDLE-HERE>' || name === '<MY-ACCOUNT-NAME-HERE>') {
    console.log('You can\'t follow yourself, Bot.')
  } else {
    console.log('I was followed by: ' + name + ' ' + screenName);
    // function that replies back to the user who followed
    tweetNow('@' + screenName + ' Thank you for the follow.');
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
//-----------------------------------------------------------------------
// Like tweet - searches for random tweets that match your query and 'likes' them

// find a random tweet and 'like' it
var likeTweet = function(){  
  var params = {
      q: '<YOUR-QUERY>', // REQUIRED
      result_type: 'recent',
      lang: 'en'
  }
  // find the tweet
  Twitter.get('search/tweets', params, function(err,data){

    if(err) {
        console.log('Error with finding the tweet to like');
    } else {
    // find tweets
    var tweet = data.statuses;
    var randomTweet = ranDom(tweet);   // pick a random tweet

    // if random tweet exists
    if(typeof randomTweet != 'undefined'){
      // Tell TWITTER to 'like'
      Twitter.post('favorites/create', {id: randomTweet.id_str}, function(err, response){
        // if there was an error while 'like'
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
// grab & 'like' as soon as program is running...
likeTweet();  
// 'like' a tweet for a given interval; 3600000ms = 1 hour
setInterval(favoriteTweet, 3600000);

// generate a random tweet to 'like'
function ranDom (arr) {  
  var index = Math.floor(Math.random()*arr.length);
  return arr[index];
};


// Array of sayings BruteBot should reply to specific queries with
  var dictumArray = [
  "Add",
  "your",
  "sayings", 
  "here"
];
  
var TWEET_FREQUENCY_MIN = 20*1000; //min range of tweet frequency in milliseconds
var TWEET_FREQUENCY_MAX = 180*1000; //max range of tweet frequency in milliseconds
var LAST_TWEET = {};
var PENDING_TWEET = {};

Twitter.stream('statuses/filter', {track: '<YOUR-PARAM-HERE>'}, function(stream) {
  stream.on('data', function(tweet) {
    PENDING_TWEET = tweet;
    console.log('[twitterbot] new tweet streamed!');
  });
  stream.on('error', function(error) {
    console.log(error);
  });
});

var RecursivePoster = function(){
  setTimeout(function(){
    if(LAST_TWEET.id_str == PENDING_TWEET.id_str){
      console.log('[RecursivePoster] no new tweets detected, skipping');
      return RecursivePoster();
    }
    var tweet = PENDING_TWEET;
    var reply = "@" + tweet.user.screen_name + " " + random.pick(dictumArray);
    Twitter.post('statuses/update', {status: reply},  function(error, tweetReply, response){
      if(error){
        console.log(error);
      }
      console.log('[RecursivePoster] posted reply:', tweetReply.text);
      LAST_TWEET = tweet;
      
      RecursivePoster();
    });  
  }, random.integer(TWEET_FREQUENCY_MIN, TWEET_FREQUENCY_MAX));
};
RecursivePoster();

//-------------------------------------------
// Reply to a specific user every time they tweet

// define the ID of the user we are interested in
var userID = '<SOME-USER-ID>';

var id_str, screen_name;
// open a stream following events from that user ID
  Twitter.stream('statuses/filter', {follow: userID}, function(stream) {
  console.log('[autoresponder] Bot started looking for tweets by ' + userID + '.');
  stream.on('data', function(tweet) {

  // if(userID == '832813975658229761') { 
      if(tweet.user.id == userID) {
        console.log('[autoresponder] ' + userID + ' just tweeted: ' + tweet.text); 
        id_str = tweet.id_str;
        screen_name = tweet.user.screen_name;

        var reply = '@' + screen_name + ' ' + random.pick(dictumArray);
        
        if (screen_name !== '<YOUR-USER-ID>'){
           Twitter.post('statuses/update', {in_reply_to_status_id: id_str,
            status: reply},
            function(error, tweet, response){
            if(error) throw error;
            console.log('[autoresponder] posted reply:', tweet.text);  
          });
        }
        
    }
   })
   
     stream.on('error', function(error) {
    throw error;
  });
});


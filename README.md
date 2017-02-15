
# BruteBot
A Node.js Twitter Application 

## About

BruteBot is a Node.js Twitter application. Unlike other AI or NLP Twitter applications, BruteBot relies on conditional logic, hence the name.

Ryan McGill wrote BruteBot's core 'RecursivePoster' function, and additional features were added by Matt Oliver.

Currently, BruteBot is programmed to:

1. Find a random tweet at a given interval, and 'like' it
2. Retweet any tweet by any member of a given 'list'
3. Reply to any tweet that matches a certain query paramater, at random intervals
4. Reply with a message to any user that follows BruteBot

## Setup

1. ```npm install```
2. Create Twitter application - https://apps.twitter.com/
3. Once Twitter application created, click 'Create my access token'
4. Add API keys and access tokens to env/api_keys_example.js
5. Change 'api_keys_example.js' to 'api_keys.js'
5. Add your application-specific queries to 'app.js'
6. ```npm run bot```


## More info

The list retweet function was inspired by [this repo](https://github.com/sugendran/node-retweeter)





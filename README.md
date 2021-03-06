# Silly and/or useful bot for [Twitch.tv](https://www.twitch.tv/) chats

## Description
This bot connects to specifict Twitch channels to do things like post custom commands or emotes for you

## Setup/Installation

* Clone the application from github

* Get a [client id and OAuth key](https://dev.twitch.tv/docs/authentication/) to use Twitch's API

* Get [access token](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth#oauth-client-credentials-flow), use [reqbin](https://reqbin.com/) for easier generation

* Create a file in the root folder called 'config.js' and add your Twitch users and keys like in the [config example](https://github.com/MilesBradt/Twitch-Chat-Bot/blob/master/config-example.js)

![congif.js example](https://i.imgur.com/9LfupZ5.jpg)

* Type 'node bot.js' to run

## Things this bot does
* ~~Posts selected emotes randomly every 15 to 30 minutes for users that are streaming online (checks Twitch's api first before posting)~~
* Posts messages based on custom commands

## Future plans

* Use API to check is user is online before posting in chat
* Randomly scramble messages from chat history, like it's trying to talk to the users
* Have custom commands added or deleted from the users, not hard coded in from me

## Support and contact details

* Contact me on Discord: Snowman#7978 or email: smbradtmichael@gmail.com

## Technologies Used

* Javascript, jQuery

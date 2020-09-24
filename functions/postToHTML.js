const { JSDOM } = require("jsdom");
const { window } = new JSDOM("");
const $ = require("jquery")(window);
const fs = require('fs').promises;


function postToHTML(cleanTarget, userName, message) {

    // var element = window.document.getElementById('chat_box');
    // element.appendChild(cleanTarget + "'s chat - " + userName + ": " + message)
    $("#chat_box").append(cleanTarget + "'s chat - " + userName + ": " + message)

}

module.exports = { postToHTML };

"use strict";
let Await = require("asyncawait/await"),
  fetch = require("node-fetch"),
  serializeText = require("./slack/serializers/serialize_text"),
  serializeFile = require("./slack/serializers/serialize_file"),
  serializeCard = require("./slack/serializers/serialize_card"),
  app_config = require("./config.json");

/*
A client to interact with slack using slack web API.
It is responsible to send bot response to slack channel.
It is being called from avaamo.js
*/

let client = {
  sendTextMessage(message) {
    let serializedMessage = serializeText(message);
    let jsonResponse = Await(fetch(`${app_config.slack.api}/chat.postMessage`, {method: "POST",headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${app_config.slack.accessToken}` },  body: JSON.stringify(serializedMessage)}).then(function(res){
      return res.json();
    }).catch(function(e){
      console.error(e)
    }));

    if(jsonResponse.ok) {
      return {success: true};
    }
    else {
      return {success: false, error: jsonResponse.error};
    }
  },

  sendCard(message) {
    let reqObject = serializeCard(message);
    console.log("Sending card to slack:::", reqObject);
    let jsonResponse = Await(fetch(`${app_config.slack.api}/chat.postMessage`, {method: "POST",headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${app_config.slack.accessToken}` },  body: JSON.stringify(reqObject) }).then(function(res){
      return res.json();
    }).catch(function(e){
      console.error(e)
    }));

    if(jsonResponse.ok) {
      return {success: true};
    }
    else {
      return {success: false, error: jsonResponse.error};
    }
  },

  sendFile(message) {
    let fileData = serializeFile(message);
    console.log("Sending file to slack:::", fileData);
    let jsonResponse = Await(fetch(`${app_config.slack.api}/files.upload`, {method: "POST",headers: { 'Authorization': `Bearer ${app_config.slack.accessToken}` },  body: fileData}).then(function(res){
      return res.json();
    }).catch(function(e){
      console.error(e)
    }));

    if(jsonResponse.ok) {
      return {success: true};
    }
    else {
      console.error("Upload file error :::", jsonResponse);
      return {success: false, error: jsonResponse.error};
    }
  }
}

module.exports = client;

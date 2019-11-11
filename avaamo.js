"use strict";
let Async = require("asyncawait/async"),
  Await = require("asyncawait/await"),
  fetch = require("node-fetch"),
  app_config = require("./config.json"),
  slack = require("./slack");

/*
Client to interact with Avaamo platform.
It makes an api call to Avaamo bot with user query,
receives the bot response and forwards it to Slack Client.
This is being called from app.js
*/

let client = {
  processUserQuery(slackEvent) {
    return Async(() => {
      let botResponse = this.getBotResponse(slackEvent.text);
      console.debug("bot response::: ", JSON.stringify(botResponse));
      this.sendBotResponseToSlack(botResponse, slackEvent.channel)
    });
  },

  processInteractiveMessage(payload) {
    return Async(() => {
      let action = payload.actions[0];
      let botResponse = this.getBotResponse(action.value);
      console.debug("bot response::: ", JSON.stringify(botResponse));
      this.sendBotResponseToSlack(botResponse, payload.channel.id);
    });
  },

  getBotResponse(query) {
    let reqBody = {
      channel_type: 'slack',
      channel_uuid: app_config.avaamo.customChannel.channelUuid,
      user: {
        first_name: app_config.avaamo.customChannel.user.firstName,
        last_name: app_config.avaamo.customChannel.user.lastName,
        uuid: app_config.avaamo.customChannel.user.uuid
      },
      message: {
        text: query
      }
    }
    let botResponse = Await(fetch(`${app_config.avaamo.webhook}`, {method: "POST",headers: { 'Content-Type': 'application/json'},  body: JSON.stringify(reqBody)}).then(function(res){
      return res.json();
    }).catch(function(e){
      console.error(e);
    }));
    return botResponse;
  },

  sendBotResponseToSlack(botResponse, channel) {
    let botReplies = botResponse.incoming_message.bot_replies;
    for(let botReply of botReplies) {
      let slackResponse;
      botReply['channel'] = channel;
      if(botReply.asset) {
        slackResponse = slack.sendFile(botReply);
      }
      else if(botReply.attachment) {
        slackResponse = slack.sendCard(botReply);
      }
      else {
        slackResponse = slack.sendTextMessage(botReply);
      }
      if(slackResponse.success) {
        console.log('Bot reply sent to slack');
      }
      else {
        console.error('error occured while sending response to slack:', slackResponse.error);
      }
    }
  }
}

module.exports = client;

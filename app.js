const app = require("express")(),
  config = require("./config.json")
  bodyParser = require("body-parser"),
  avaamo = require("./avaamo");

app.use(bodyParser.json({ limit: "50mb" })); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" })); // to support url encoded bodies

/*
This end-point is subscribed to slack events
*/
app.post('/action', function (req, res) {
  console.debug("slack event received: ", req.body);
  let event = req.body.event;

  if(req.body.challenge) { // needed to verify this end-point with slack
    res.send(req.body.challenge);
    return;
  }

  if(event && event.type == 'message' && !event.subtype) {
    avaamo.processUserQuery(event)();
  }
  res.send({ success: true });
});

/*
This end point is subscribed to interactive actions,
like button click by user
*/
app.post('/interactive_action', function (req, res) {
  console.debug("slack interactive event received: ", req.body);
  avaamo.processInteractiveMessage(JSON.parse(req.body.payload))();
})

app.listen(config.port, function () {
  console.log(`Slack connector running on port ${config.port}`);
});

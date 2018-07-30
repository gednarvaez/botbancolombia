/*************************************************************************************************

  Define global variables for NPM packages and Cloud Foundry environment

*************************************************************************************************/
"use strict";


var express = require('express'),
  
    app = express(),
    bodyParser = require('body-parser'),
    watson_conversation = require('watson-developer-cloud/assistant/v1');

/************************************************************************************************* 
  
  Start the server 
  
*************************************************************************************************/

const port = process.env.PORT || 3000;
app.use(bodyParser());

app.use(express.static(__dirname + '/public'));

app.listen(port, function(){
    console.log("Escuchando en "+ port)
});

/*************************************************************************************************

 Watson Conversation

*************************************************************************************************/
var conversation = new watson_conversation({
    version: '2018-07-10',
    username: '0bd1da9e-84fb-4eab-b167-f6eaf7ae11cb',
    password: 'D1N241W3rR6q',
    url: "https://gateway.watsonplatform.net/conversation/api",
});


app.post('/api/bot', function (req, res) {
    var workspace = '9c7164ff-044b-41ee-af64-eda2c5bea9ae';

    if (!workspace) {
        console.log("No workspace detected. Cannot run the Watson Conversation service.");
    }

    var params = {
        workspace_id: workspace,
        context: {},
        input: {}
    };

    if (req.body) {
        if (req.body.input) {
            params.input = req.body.input;
        }

        if (req.body.context) {
            params.context = req.body.context;
        }
    }

    conversation.message(params, function (err, data) {
        if (err) {
            return res.status(err.code || 500).json(err);
        }

        return res.json(data);
    });

});


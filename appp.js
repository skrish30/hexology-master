const express = require("express");
const rp = require("request-promise");
const cfenv = require("cfenv");
const app = express();
const server = require("http").createServer(app);
const io = require('socket.io')(server);
require('dotenv').config({silent: true});
const fs = require('fs');


//modules for V2 assistant
var bodyParser = require('body-parser'); // parser for post requests


//Import Watson Developer Cloud SDK
var AssistantV2 = require('watson-developer-cloud/assistant/v2'); // watson sdk
const DiscoveryV1 = require('watson-developer-cloud/discovery/v1');


// Get the environment variables from Cloud Foundry
const appEnv = cfenv.getAppEnv();

// Serve the static files in the /public directory
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// Create the Conversation object
  var assistant = new AssistantV2({
  version: '2018-11-08'
});

var newContext = {
  global : {
    system : {
      turn_count : 1
    }
  }
};

// Create the Discovery object
const discovery = new DiscoveryV1({
  version: '2017-08-01',
  url: process.env.DISCOVERY_URL || 'https://gateway.watsonplatform.net/discovery/api',
});


// start server on the specified port and binding host
server.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

let Types=[
  "Person",
  "Location",
  "Quantity",
  "Company",
  "Facility",
  "JobTitle"
]

READFile(Types)

function READFile(Types){
  Types.forEach((Type)=>{
    
    fs.readFile('./data'+Type+'.json','utf8',(err,data)=>{
      data = JSON.parse(data);
      
      Entype = data.aggregations[0].aggregations[0].results;
      //console.log(Type);

      Entype.forEach((number)=>{
        entities = number.key;
        console.log(entities);
        console.log(Type);
        io.emit(number, entities)
      })
    })
  });
}

// io.on('connection', function(socket) {
//   console.log('a user has connected');

//   // Handle incomming chat messages
//   socket.on('chat message', function(msg) {
//     console.log('message: ' + msg);
//     io.emit('chat message', "you: " + msg)
//     })
  
//   ///////////////////////

//   //let Type_Quantity = JSON.parse(fs.readFile('./dataQuantity.json', 'utf8'))
//   //let Type_Person = JSON.parse(fs.readFile('./dataPerson.json', 'utf8'))
//   //let Type_Location = JSON.parse(fs.readFile('./dataLocation.json', 'utf8'))
//   //let Type_Company = JSON.parse(fs.readFile('./dataCompany.json', 'utf8'))
//   //let Type_Facility = JSON.parse(fs.readFile('./dataFacility.json', 'utf8'))
//   //let Type_JobTitle = JSON.parse(fs.readFile('./dataJobTitle.json', 'utf8'))

//   quantity = Type_Quantity.aggregations[0].aggregations.results.key;
//   io.emit('Quantity', quantity)





//     // ***************************************

//    });

app.get('/', function(req, res){
  res.sendFile('index.html');
});

/*****************************
    Function Definitions
******************************/
function queryDiscovery(queryString, callback){
  //function to query Discovery
  let queryParams ={
    environment_id: process.env.ENVIRONMENT_ID,
    collection_id: process.env.COLLECTION_ID,
    query: queryString, 
    passages: true,
    passages_characters: 100,
    aggregation: "nested(enriched_text.entities).filter(enriched_text.entities.type::" + entities + ").term(enriched_text.entities.text,count:10)"
  };
  console.log(queryParams);
  discovery.query(queryParams)
    .then(queryResponse =>{
      //console.log(JSON.stringify(queryResponse, null, 2));
      /*
      fsPromises.writeFile("data.txt", JSON.stringify(queryResponse, null, 2))
        .then(()=> console.log("success"))
        .catch(()=> console.log("failure"))
      */
      console.log('successful query');
      callback(null,queryResponse);
    })
    .catch(err =>{
      console.log('error',err);
      callback(err,null);
    });
};

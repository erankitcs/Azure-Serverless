//Event Grid topic ARN : https://speakerapp-eg.australiaeast-1.eventgrid.azure.net/api/events
const axios = require("axios");
const uuid = require("uuid").v4;
const mongo = require("mongodb").MongoClient;

module.exports =  function (context, req) {

    context.log('CreateSpeaker function processing request.');
    context.log("req.body",req.body)
  
    if (req.body){

        let speakerData = req.body;
        publishToEventGrid(speakerData);
        //Connecting to MongoClient
        mongo.connect(
            process.env.speaker_COSMOSDB,
            (err, client) => {
                context.log(err);
                context.log(client);
                let send = response(client, context);
                if (err) send(500, err.message);
                let db = client.db("speakerapp");
                db.collection("speakers").insertOne(speakerData,(err, speakerData)=> {
                    if (err) send(500, err.message)
                    send(200, speakerData)
                });
            }
        );
    } else {
        context.res = {
            status: 400,
            body: "Plase pass a name in the body."
        };
    }

};

//Helper function to build the response
function response(client, context){
    return function(status, body){
        context.res ={
            status: status,
            body: body
        };
        client.close();
        context.done();
    }
};

//Helper function to publish event to eventGrid
function publishToEventGrid(speaker){
    console.log("In Publish to eventGrid function.");
    const topicKey = process.env.EG_TopicKey;
    const topicHostName = "https://speakerapp-eg.australiaeast-1.eventgrid.azure.net/api/events"

    let data = speaker;

    let events = [
        {
            id : uuid(),
            subject: "New Speaker Image created.",
            dataVersion: "1.0",
            eventType: "Microsoft.MockPublisher.TestEvent",
            eventTime: new Date(),
            data: data
        }
    ];
    console.log("Here is the event data: ", events[0].data);
    axios.post(topicHostName,events, {
        headers: { "aeg-sas-key": topicKey }
    });
};
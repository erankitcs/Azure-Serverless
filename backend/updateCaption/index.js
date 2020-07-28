const mongo = require("mongodb").MongoClient;

module.exports = async function (context, req) {
    context.log("updateCaption function processing request");
    context.log("Body-",req.body);
    context.log("Query-",req.query);
    if (req.body){
        let speakerData = req.body;
        //connect to MongoDB
    mongo.connect(
        process.env.speaker_COSMOSDB,
        (err, client) => {
          let send = response(client, context);
          if (err) send(500, err.message);
          let db = client.db("speakerapp");
          speakerId = parseInt(req.query.id);
          db.collection("speakers").updateOne(
            { id: speakerId },
            {
              $set: {
                headshotCaption: speakerData.headshotCaption
              }
            },
            (err, speakerData) => {
              if (err) send(500, err.message);
              context.log("speakerData", speakerData);
              send(200, speakerData);
            }
          );
        }
      );

    }
    else {

        context.res = {
            status: 400,
            body: "Please pass name in the body"
          };
    }
};


//Helper function to build the response
function response(client, context) {
    return function(status, body) {
      context.res = {
        status: status,
        body: body
      };
  
      client.close();
      context.done();
    };
  }
const mongo = require("mongodb").MongoClient;

module.exports =  function (context, req) {
    context.log("getSpeaker function processing request.");
    if (req.query.id){
        mongo.connect(
            process.env.speaker_COSMOSDB,
            (err, client) => {
                let send = response(client, context);
                if (err) send(500, err.message);
                let db = client.db("speakerapp");
                let speakerId = parseInt(req.query.id);
                let query2 = { id: speakerId };
                db.collection("speakers").findOne(query2,(err, result) =>{
                    if (err) send(500, err.message);
                    send(200, JSON.parse(JSON.stringify(result)));
                });
            }
        );
    } else {
        context.res = {
          status: 400,
          body: "Please pass an id in the query string"
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

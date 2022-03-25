const { MongoClient } = require("mongodb");
 
// Replace the following with your Atlas connection string                                                                                                                                        
const url = `mongodb+srv://iNFiENiTE:${require('./‎')}@infienite-cluster.4j1az.mongodb.net/myfirstmongodb?retryWrites=true&w=majority`;
const client = new MongoClient(url);

async function run() {
    try {
        await client.connect();
        console.log("Connection established successfully!")
        const col= client.db().collection("iNFiENiTE");

        const read = await col.findOne();

        console.log(read._id);
        /*
        const col = db.collection("peserta");
        let doc = {
            _id:"7",
            _id_pertandingan: "1",
            nama:"Khilfi",
            markah:"0"
        };

        const p = await col.insertOne(doc)
        console.log("Connected correctly to server");

        const myDoc = await col.find({_id:"3"});
        console.log(myDoc);
        */

    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await client.close();
    }
}

run().catch(console.dir);
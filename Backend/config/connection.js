// const { connect }  = require("mongoose");
// async function conn(){
//     connect(process.env.Mongo_uri).then((data)=>{
// console.log("MongoDb connected to server");
//     });
// }
// module.exports=conn;
import { connect } from 'mongoose';

async function conn() {
  connect(process.env.Mongo_uri).then(() => {
    console.log("MongoDb connected to server");
  });
}

export default conn;

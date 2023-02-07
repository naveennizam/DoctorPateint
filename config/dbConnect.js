const { default: mongoose } = require("mongoose")

const dbConnect = ()=>{
try
{
    mongoose.set("strictQuery", false);

    const conn = mongoose.connect(process.env.MONGODB_URL)
    console.log(' connected');

}
catch(error){
    console.log('NOT connected');
}
}
module.exports = dbConnect;
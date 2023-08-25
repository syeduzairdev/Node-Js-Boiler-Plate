const express = require('express')
const app = express();
const cors = require('cors')
const bodyParser = require("body-parser");
const connectDB = require('./config/db');
const sampleRoute=require('./routes/index')

app.use(cors())
app.use(bodyParser.json());
//Connecting Database
connectDB();

//path route
app.use('/your-path',sampleRoute);

//test route
app.get('/test',(req,res)=>{
    res.json({
        success:true,
        message:"Server works!!"
    })
})

//running node js server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require('express');
const mongoose = require('mongoose');
const MONGO_URL=process.env.MONGOURL;
mongoose.connect(MONGO_URL)
    .then(()=>console.log("Connected"))
    .catch((err)=>console.log("Error in connection "))
const app = express();
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use('/medicine',require('./Router/medicine'))
app.use('/order',require('./Router/order'))
app.use('/supplier',require('./Router/supplier'))
app.listen(3000, ()=>console.log('Listening to port'))
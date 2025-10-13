
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: {
     type: String, 
     required: true
     },
  contact: {
     type: String,
     minLength: 10
    },
  age: {
     type: Number 
    },
  address: { 
    type: String 
},
});

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
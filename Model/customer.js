const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  pharmacy_name: {
     type: String, 
     required: true
     },
  contact_number: {
     type: String,
     minLength: 10
    },
  License: {
     type: String,
     required: true,
     unique: true
    },
  address: { 
    type: String 
},
});

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;

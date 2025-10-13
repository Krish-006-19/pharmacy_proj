
const mongoose = require("mongoose");
const Schema = mongoose.Schema
const supplierSchema = new Schema({
  name: { 
    type: String,
     required: true 
    },
  contact: {
     type: String 
    },
  Batch_number: {
    type:String,
    required: true
  },
  address: {
     type: String 
    },
});

const Supplier = mongoose.model("Supplier", supplierSchema);
module.exports = Supplier;

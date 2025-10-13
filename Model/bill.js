
const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  order: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: "Order" },
  paymentStatus:
   { type: String, enum: ["Paid", "Pending"],
     default: "Pending"
     },
  billDate: { 
    type: Date, 
    default: Date.now },
});

module.exports = mongoose.model("Bill", billSchema);

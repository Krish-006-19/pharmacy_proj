const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pharmacySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required:true
    },
    phone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    medicine_data: [
      {
        type: Schema.Types.ObjectId,
        ref: "Medicine",
      },
    ],
    supplier: [
      {
        type: Schema.Types.ObjectId,
        ref: "Supplier",
      },
    ],
    
  },
  { timestamps: true }
);

const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);
module.exports = Pharmacy;

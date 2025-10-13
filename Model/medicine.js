const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const medicineSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stockAvailable: {
      type: Number,
      default: 0,
    },
    manufactureDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
    },
  },
  { timestamps: true }
);

const Medicine = mongoose.model("Medicine", medicineSchema);
module.exports = Medicine;

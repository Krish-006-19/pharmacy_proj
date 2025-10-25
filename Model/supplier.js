const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const supplierSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    licenseNumber: {
      type: String,
      trim: true,
    },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    suppliedMedicines: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
      },
    ],
    batches: [
      {
        batchNumber: String,
        expiryDate: Date,
        quantity: Number,
      },
    ],

  
  },

  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema);
module.exports = Supplier;

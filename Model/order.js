const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  pharmacy: {
    type: Schema.Types.ObjectId,
    ref: "Pharmacy",
    required: true,
  },

  receivedFrom: {
    type: Schema.Types.ObjectId,
    ref: "Supplier",
    default: null,
  },

  medicines: [
    {
      medicine: {
        type: Schema.Types.ObjectId,
        ref: "Medicine",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],

  orderType: {
    type: String,
    enum: ["incoming", "outgoing"],
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "delivered", "cancelled"],
    default: "pending",
  },

  orderDate: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;

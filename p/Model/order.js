const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  // Reference to the pharmacy that owns/places the order
  pharmacy: {
    type: Schema.Types.ObjectId,
    ref: "Pharmacy",
  },

  // Reference to the supplier (if this order is coming from/for a supplier)
  receivedFrom: {
    type: Schema.Types.ObjectId,
    ref: "Supplier",
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

  // orderType kept flexible because routers use several string values
  // (e.g. 'supplierRequest', 'supplierConfirmed', 'supplierRejected', 'incoming', 'outgoing')
  orderType: {
    type: String,
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

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const prescriptionSchema = new Schema(
  {
    date: { type: Date, default: Date.now },
    doctorName: { type: String },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    pharmacy: { type: Schema.Types.ObjectId, ref: "Pharmacy" },
    medicines: [{ type: Schema.Types.ObjectId, ref: "Medicine" }],
  },
  { timestamps: true }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);
module.exports = Prescription;

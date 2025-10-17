const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");
const Order = require("../Model/order");

router.get("/", async (req, res) => {
  try {
    let orders = await Order.find({});
    if (!orders) {
      return res
        .status(200)
        .json({ success: true, message: "No Orders Yet ! " });
    }
    return res.status(200).json({ orders: orders, success: true });
  } catch (error) {
    return res
      .status(200)
      .json({
        message: "Something Went Wrong in finding Orders",
        success: false,
      });
  }
});

router.post("/placeOrder/:pharmacyId/:supplierId", async (req, res) => {
  const { medicines } = req.body;
  const { pharmacyId, supplierId } = req.params;

  if (
    !pharmacyId ||
    !supplierId ||
    !Array.isArray(medicines) ||
    medicines.length === 0
  )
    return res.status(400).json({ success: false, message: "Invalid payload" });

  const idsToValidate = [
    pharmacyId,
    supplierId,
    ...medicines.map((m) => m.medicine),
  ];
  if (!idsToValidate.every((id) => mongoose.Types.ObjectId.isValid(id)))
    return res
      .status(400)
      .json({ success: false, message: "Invalid ObjectId" });

  try {
    const order = await Order.create({
      pharmacy: pharmacyId,
      receivedFrom: supplierId,
      medicines,
      orderType: "supplierRequest",
      status: "pending",
      orderDate: new Date(),
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../Model/order');
const Medicine = require('../Model/medicine');



router.get('/orderRec', (req,res)=>[
    // New Order form 
])


router.put('/confirm/:orderId', async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId))
    return res.status(400).json({ success: false, message: 'Invalid order ID' });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'pending') throw new Error('Order already processed');

    for (const { medicine, quantity } of order.medicines) {
      await Medicine.updateOne(
        { _id: medicine },
        { $inc: { stockAvailable: medicine.stockAvailable+quantity } },
        { session }
      );
    }

    order.status = 'confirmed';
    order.orderType = 'supplierConfirmed';
    await order.save({ session });

    await session.commitTransaction();
    res.status(200).json({ success: true, message: 'Order confirmed and stock updated' });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;

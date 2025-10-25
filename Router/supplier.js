// ...existing code...
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Supplier = require('../Model/supplier');
const Order = require('../Model/order');
const Medicine = require('../Model/medicine');


router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find({}).lean();
    return res.status(200).json({ success: true, data: suppliers });
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ success: false, message: 'Invalid supplier id' });

  try {
    const supplier = await Supplier.findById(id).lean();
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    return res.status(200).json({ success: true, data: supplier });
  } catch (err) {
    console.error('Error fetching supplier:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};
    const created = await Supplier.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Error creating supplier:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.put('/:id/order', async (req, res) => {
  const { id: supplierId } = req.params;
  const { orderId, action, reason } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(supplierId))
    return res.status(400).json({ success: false, message: 'Invalid supplier id' });
  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId))
    return res.status(400).json({ success: false, message: 'Invalid order id' });
  if (!['accept', 'reject'].includes(action))
    return res.status(400).json({ success: false, message: 'action must be "accept" or "reject"' });

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure this supplier is the intended receiver (optional check)
    if (order.receivedFrom && order.receivedFrom.toString() !== supplierId) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: 'Supplier not authorized for this order' });
    }

    if (order.status && order.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Order already processed' });
    }

    if (action === 'reject') {
      order.status = 'rejected';
      if (reason) order.rejectionReason = reason;
      order.orderType = 'supplierRejected';
      await order.save({ session });
      await session.commitTransaction();
      return res.status(200).json({ success: true, message: 'Order rejected' });
    }


    const medItems = order.medicines || [];
    for (const item of medItems) {
      const medId = item.medicine;
      const qty = Math.max(0, Number(item.quantity) || 0);
      if (qty === 0) continue;
      await Medicine.updateOne({ _id: medId }, { $inc: { stockAvailable: qty } }, { session });
    }

    order.status = 'confirmed';
    order.orderType = 'supplierConfirmed';
    await order.save({ session });

    await session.commitTransaction();

    const populated = await Order.findById(orderId).populate('medicines.medicine').lean();
    return res.status(200).json({ success: true, message: 'Order accepted and stock updated', data: populated });
  } catch (err) {
    await session.abortTransaction();
    console.error('Error processing supplier order:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    session.endSession();
  }
});


router.get('/:id/history', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ success: false, message: 'Invalid supplier id' });

  try {
    const orders = await Order.find({ receivedFrom: id })
      .sort({ orderDate: -1 })
      .populate('medicines.medicine')
      .populate('pharmacy')
      .lean();
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error('Error fetching supplier history:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

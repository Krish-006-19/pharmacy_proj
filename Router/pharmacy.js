const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');

const Pharmacy = require('../Model/pharmacy');
const Order = require('../Model/order');
const Medicine = require('../Model/medicine');

router.get('/', async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({}).lean();
    return res.status(200).json({ success: true, data: pharmacies });
  } catch (err) {
    console.error('Error fetching pharmacies:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid id' });
  }
  try {
    const pharmacy = await Pharmacy.findById(id).lean();
    if (!pharmacy) return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    return res.status(200).json({ success: true, data: pharmacy });
  } catch (err) {
    console.error('Error fetching pharmacy:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// router.post('/', async (req, res) => {
//   try {
//     const payload = req.body || {};
//     const created = await Pharmacy.create(payload);
//     return res.status(201).json({ success: true, data: created });
//   } catch (err) {
//     console.error('Error creating pharmacy:', err);
//     return res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};
    const created = await Pharmacy.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Error creating pharmacy:', err.message, err.errors);
    return res.status(500).json({ success: false, message: err.message });
  }
});


router.post('/:id/order', async (req, res) => {
  const { id: pharmacyId } = req.params;
  const { receivedFrom, medicines } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(pharmacyId)) {
    return res.status(400).json({ success: false, message: 'Invalid pharmacy id' });
  }
  if (!Array.isArray(medicines) || medicines.length === 0) {
    return res.status(400).json({ success: false, message: 'medicines array is required' });
  }
  const medIds = medicines.map(m => m.medicine);
  if (!medIds.every(mid => mongoose.Types.ObjectId.isValid(mid))) {
    return res.status(400).json({ success: false, message: 'Invalid medicine id in medicines' });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const pharmacy = await Pharmacy.findById(pharmacyId).session(session);
    if (!pharmacy) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    }

    const docs = await Medicine.find({ _id: { $in: medIds } }).session(session);
    if (docs.length !== medIds.length) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'One or more medicines not found' });
    }

    const isIncoming = Boolean(receivedFrom);

    if (!isIncoming) {
      for (const item of medicines) {
        const doc = docs.find(d => d._id.equals(item.medicine));
        const qty = Math.abs(Number(item.quantity) || 0);
        if (qty < 1) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ success: false, message: 'Quantity must be >= 1' });
        }
        if ((doc.stockAvailable ?? 0) < qty) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ success: false, message: `Insufficient stock for medicine ${doc._id}` });
        }
      }
    } else {
      
      for (const item of medicines) {
        const qty = Math.abs(Number(item.quantity) || 0);
        if (qty < 1) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ success: false, message: 'Quantity must be >= 1' });
        }
      }
    }

    const orderPayload = {
      pharmacy: pharmacyId,
      receivedFrom: receivedFrom || undefined,
      medicines: medicines.map(m => ({ medicine: m.medicine, quantity: Number(m.quantity) })),
      orderDate: new Date(),
    };

    const created = await Order.create([orderPayload], { session });

    for (const item of medicines) {
      const qty = Math.abs(Number(item.quantity));
      if (isIncoming) {
        await Medicine.updateOne({ _id: item.medicine }, { $inc: { stockAvailable: qty } }, { session });
      } else {
        await Medicine.updateOne({ _id: item.medicine }, { $inc: { stockAvailable: -qty } }, { session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    const populated = await Order.findById(created[0]._id)
      .populate('medicines.medicine')
      .populate('receivedFrom')
      .lean();

    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating order for pharmacy:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  } 
  finally {
    session.endSession();
  }
});

router.get('/:id/history', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid id' });
  }
  try {
    const orders = await Order.find({ pharmacy: id })
      .sort({ orderDate: -1 })
      .populate('medicines.medicine')
      .populate('receivedFrom')
      .lean();
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error('Error fetching pharmacy history:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

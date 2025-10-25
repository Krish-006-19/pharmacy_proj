const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const Medicine = require('../Model/medicine');
const Pharmacy = require('../Model/pharmacy')

router.get('/',async(req,res)=>{
  try{
    const medicine = await Medicine.find({});
    if(!medicine){
      return res.status(200).json({ success : true, message : "No data found! "});
    }
    return res.status(200).json({ success: true, data: medicine })
  } catch(err){
    console.error('Error fetching medicine:', err);
    return res.status(404).json({ success: false, message: 'Not found!' });
  }
})
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid id' });
  }

  try {
    const medicine = await Medicine.findById(id).lean(); 
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    return res.status(200).json({ success: true, data: medicine });
  } catch (err) {
    console.error('Error fetching medicine:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Yha New Medicine add krte time ek form se new med ko add kraege Jisme medicene ki info rhegi 
// lekin ye to pharmacy wise rhga naa ki konsi wali medicene add krna hai krke

router.post('/:pharmaId', async (req, res) => {
  const { pharmaId } = req.params;

  if (!pharmaId || !mongoose.Types.ObjectId.isValid(pharmaId)) {
    return res.status(400).json({ success: false, message: 'Invalid pharmacy id' });
  }

  const { name, price, stockAvailable, manufactureDate, expiryDate } = req.body;

  if (!name || price == null || stockAvailable == null) {
    return res.status(400).json({ success: false, message: 'name, price and stockAvailable are required' });
  }

  try {
    const pharma = await Pharmacy.findById(pharmaId);
    if (!pharma) return res.status(404).json({ success: false, message: 'Pharmacy not found' });

    const newMed = new Medicine({
      name,
      price: Number(price),
      stockAvailable: Number(stockAvailable),
      manufactureDate: manufactureDate ? new Date(manufactureDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    });

    await newMed.save();

    if (Array.isArray(pharma.medicine_data)) {
      pharma.medicine_data.push(newMed._id);
    } else {
      pharma.medicine_data = [newMed._id];
    }

    await pharma.save();

    return res.status(201).json({ success: true, data: newMed });
  } catch (err) {
    console.error('Error creating medicine:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid id' });
  }

  try {
    const { price, stockAvailable, manufactureDate, expiryDate } = req.body;

    if (price == null || stockAvailable == null) {
      return res.status(400).json({ success: false, message: 'price and stockAvailable are required' });
    }

    const update = {
      price: Number(price),
      stockAvailable: Number(stockAvailable),
    };

    if (manufactureDate) update.manufactureDate = new Date(manufactureDate);
    if (expiryDate) update.expiryDate = new Date(expiryDate);

    const med = await Medicine.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });

    return res.status(200).json({ success: true, data: med });
  } catch (err) {
    console.error('Error updating medicine:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;

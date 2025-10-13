const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const Medicine = require('../Model/medicine');

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
// tu yaha data se bhi fetch kr skta h number of meds available
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid id' });
  }

  try {
    const medicine = await Medicine.findById(id).lean(); // .lean() returns plain object
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    return res.status(200).json({ success: true, data: medicine });
  } catch (err) {
    console.error('Error fetching medicine:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// bin faltu k routes mt bna route esa hona chahiiye jo allinone ho ekk hi url se particular kaam hona chihiye
// router.get('/:id/stock', async (req, res) => {
//   const { id } = req.params;
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ success: false, message: 'Invalid id' });
//   }

//   try {
//     const medicine = await Medicine.findById(id, 'stockAvailable').lean();
//     if (!medicine) {
//       return res.status(404).json({ success: false, message: 'Medicine not found' });
//     }
//     const stock = Number(medicine.stockAvailable ?? 0);
//     const isMoreThanMinimum = stock >= 5;

//     return res.status(200).json({
//       success: true,
//       isMoreThanMinimum,
//       stockAvailable: stock
//     });
//   } catch (err) {
//     console.error('Error fetching medicine stock:', err);
//     return res.status(500).json({ success: false, message: 'Server error' });
//   }
// })

module.exports = router;
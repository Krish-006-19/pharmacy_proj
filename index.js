if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Use env var or sensible local default for development/testing
const MONGO_URL = process.env.MONGOURL || 'mongodb://127.0.0.1:27017/pharmacy_db';
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGO_URL)
  .then(() => console.log(`Connected to MongoDB (${MONGO_URL})`))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    // Exit with failure so process managers / CI notice
    process.exit(1);
  });

const app = express();
// app.use(cors());
import express from "express";
import cors from "cors";

const app = express();

// Allow requests from your React app
app.use(cors({origin: ["http://localhost:5173", "https://yourfrontenddomain.com"],credentials: true}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/medicine', require('./Router/medicine'));
app.use('/order', require('./Router/order'));
app.use('/supplier', require('./Router/supplier'));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

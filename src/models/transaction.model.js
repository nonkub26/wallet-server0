const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require('../models/user.model')

const operations = ['topup', 'withdraw', 'buy']

const transactionSchema = new Schema({
  operation: { type: String, required: true, enum: operations },
  user_id: { type: String, required: true },
  destination_user_id: { type: String },
  amount: { type: Number, default: 0, required: true },
  reference: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
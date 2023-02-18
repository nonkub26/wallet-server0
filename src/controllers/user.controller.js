const User = require("../models/user.model.js");
const Transaction = require("../models/transaction.model.js");
//สร้างบัญชี
exports.register = async (req, res) => {
  try {
    let user = new User({
      name: req.body.name,
      phone_number: req.body.phone_number,
      email: req.body.email,
    });
    user.password = await user.hashPassword(req.body.password);
    let createdUser = await user.save();
    res.status(200).json({
      msg: "New user created",
      data: createdUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
};
//ล็อคอิน
exports.login = async (req, res) => {
  const login = {
    email: req.body.email,
    password: req.body.password,
  };
  // console.log(login)
  try {
    let user = await User.findOne({
      email: login.email,
    });
    // console.log(user);
    //check if user exit
    if (!user) {
      res.status(400).json({
        type: "Not Found",
        msg: "Wrong Login Details",
      });
    }

    let match = await user.compareUserPassword(login.password, user.password);
    if (match) {
      let token = await user.generateJwtToken(
        {
          user,
        },
        "secret",
        {
          expiresIn: 604800,
        }
      );

      if (token) {
        res.status(200).json({
          success: true,
          token: token,
          userCredentials: user,
        });
      }
    } else {
      res.status(400).json({
        type: "Not Found",
        msg: "Wrong Login Details",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      type: "Something Went Wrong",
      msg: err,
    });
  }
};
//เติมเงิน
exports.topup = async (req, res) => {
  let amount = req.body.amount;
  let id = req.body.id;
  let location = req.body.location;
  //ค้นหา user ตาม id แล้ว +balance
  User.findByIdAndUpdate(id, { $inc: { balance: amount } }).exec(
    async (err, result) => {
      //create as transaction
      let transaction = new Transaction({
        operation: "topup",
        user_id: id,
        amount: amount,
        reference: "topup at  " + location,
      });
      let completeTransaction = await transaction.save();

      User.findById(id).exec((err, result) => {
        res.status(200).json({
          msg: "OK",
          data: {
            current: result,
            transaction: completeTransaction,
          },
        });
      });
    }
  );
  //console.log(req.body);
};
//ถอนเงิน
exports.withdraw = async (req, res) => {
  let amount = req.body.amount;
  let id = req.body.id;
  let location = req.body.location;
  //ค้นหา user ตาม id แล้ว +balance
  User.findByIdAndUpdate(id, { $inc: { balance: -amount } }).exec(
    async (err, result) => {
      //create as transaction
      let transaction = new Transaction({
        operation: "withdraw",
        user_id: id,
        amount: amount,
        reference: "withdraw at  " + location,
      });
      let completeTransaction = await transaction.save();

      User.findById(id).exec((err, result) => {
        res.status(200).json({
          msg: "OK",
          data: {
            current: result,
            transaction: completeTransaction,
          },
        });
      });
    }
  );
  //console.log(req.body);
};
//โอนจ่ายร้านค้า
exports.buy = async (req, res) => {
  let amount = req.body.amount;
  let source_id = req.body.source_id;
  let dest_id = req.body.dest_id;

  //ค้นหา user ตาม id แล้ว +balance
  User.findByIdAndUpdate(source_id, { $inc: { balance: -amount } }).exec(
    async (err, result) => {
        
      //โอนเข้าบัญชีร้าน
      User.findByIdAndUpdate(dest_id, { $inc: { balance: amount } }).exec(
        async (err, result) => {
          let transaction = new Transaction({
            operation: "buy",
            user_id: source_id,
            destination_user_id: dest_id,
            amount: amount,
            reference: "paid to " + dest_id,
          });
          let completeTransaction = await transaction.save();

          User.findById(source_id).exec((err, result) => {
            res.status(200).json({
              msg: "OK",
              data: {
                current: result,
                transaction: completeTransaction,
              },
            });
          });
        }
      );
      //create as transaction
    }
  );
  //console.log(req.body);
};
//ประวัติการจ่าย
exports.getHistory = async (req, res) => {
  let id = req.params.id;
  Transaction.find({ user_id: id })
    .sort({ createdAt: -1 })
    .exec((err, result) => {
      res.status(200).json({
        msg: "Search OK",
        data: result,
      });
    });
};

exports.transfer= async (req, res) => {
  let amount = req.body.amount;
  let source_id = req.body.source_id;
  

  //ค้นหา user ตาม id แล้ว +balance
  User.findByIdAndUpdate(source_id, { $inc: { balance: -amount } }).exec(
    async (err, result) => {
        
      //โอนเข้าบัญชีuser
      User.findByIdAndUpdate(source_id, { $inc: { balance: amount } }).exec(
        async (err, result) => {
          let transaction = new Transaction({
            operation: "transfer",
            user_id: source_id,
            destination_user_id: source_id,
            amount: amount,
            reference: "paid to " + source_id,
          });
          let completeTransaction = await transaction.save();

          User.findById(source_id).exec((err, result) => {
            res.status(200).json({
              msg: "OK",
              data: {
                current: result,
                transaction: completeTransaction,
              },
            });
          });
        }
      );
      //create as transaction
    }
  );
  //console.log(req.body);
};

exports.getUser = async (req, res) => {
  let id = req.params.id;
  User.findById(id).exec((err, result) => {
    res.status(200).json({
      msg: "Search OK",
      data: result,
    });
  });
}
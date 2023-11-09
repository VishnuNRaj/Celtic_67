const Razorpay = require('razorpay')
require('dotenv').config();

const instance = new Razorpay({
  key_id: process.env.ID,
  key_secret: process.env.SECRET,
});

async function generateOrder(id, total) {
  return new Promise((resolve, reject) => {
    const options = {
      amount: total,
      currency: "INR",
      receipt: 'order_' + id
    };
    instance.orders.create(options, function (err, order) {
      if (err) {
        console.error(err);
      }
      console.log(order);
      resolve(order)
    });
  })

}


function refundOrder(orderData) {
  return new Promise((resolve, reject) => {
    const options = {
      "amount": orderData.total,
      "speed": "optimum",
      "receipt": "rfnd _" + orderData._id
    }
    instance.payments.refund(orderData.paymentId,options,function (err,data) {
      resolve(data)
    })
  })
}

module.exports = { generateOrder, refundOrder }
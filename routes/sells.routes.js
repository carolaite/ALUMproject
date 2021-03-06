const express = require("express");
const uploadCloud = require("../public/images/cloudinary/cloudinary");

const Order = require("../models/orders");
const Product = require("../models/product");
const User = require("../models/User");

const router = express.Router();

router.use((req, res, next) => {
  if (req.session.currentUser) {
    next();
  } else {
    res.redirect("/login");
  }
});

let userId = "";
let myAds = "";
let myTransactions = "";
let buyer = "";
// let productIdArr = [];
// let productArr = [];
// let seller = [];

const searchMyAds = async () => {
  myAds = "";
  myAds = await Product.find({ userID: { $eq: userId } });
};

const serchTransactions = async () => {
  myTransactions = "";
  productIdArr = [];
  myTransactions = await Order.find({ buyerID: { $eq: userId } })
    .populate("productID")
    .populate("sellerID") 
    .populate("buyerID");

};


// const searchShopping = async () => {
//   productArr = [];
//   for (const key of productIdArr) {
//     let oneProduct = await Product.findOne({ _id: { $eq: key } });
//     productArr.push(oneProduct);
//   }
// };

// const searchSeller = async () => {
//   seller = [];
//   for (const key of myTransactions) {
//     let oneSeller = await User.findOne({
//       _id: { $eq: key.sellerID }
//     });
//     seller.password = undefined;
//     seller.push(oneSeller);
//   }
// };

// const mergeProdTrans = () => {
//   for (let i = 0; i < productArr.length; i += 1) {
//     for (let j = 0; j < myTransactions.length; j += 1) {
//       if (productArr[i].userID === myTransactions[j].sellerID) {
//         productArr[i].actions = myTransactions[j].actions;
//       }
//     }
//   }
//   return productArr;
// };

router.get("/auth/sells", async (req, res, next) => {
  userId = req.session.currentUser._id;
  await searchMyAds();
  await serchTransactions();
  // await searchShopping();
  // await searchSeller();
  // mergeProdTrans();
  try {
    //console.log("myAds", myAds);
    // console.log("ProductArr", productArr);
    //odos os Anúnciosconsole.log("myTransactions", myTransactions);
    //console.log("buyer", buyer);
    // console.log("seller", seller);
    return res.render("auth/sells", {
      myAds,
      myTransactions,
      buyer
    });
  } catch (err) {
    return res.render("auth/sells", {
      errorMessage: `Erro ao criar Negociação: ${err}`
    });
  }
});

router.post(
  "/auth/myAds",
  uploadCloud.single("imgPath"),
  async (req, res, next) => {
    const { title, school } = req.body;

    if (!title || !school)
      return res.render("auth/sells", {
        errorMessage: `Dados insuficientes!`
      });

    req.body.userID = req.session.currentUser._id;
    req.body.imgPath = req.file ? req.file.url : "";
    req.body.imgName = req.file ? req.file.originalname : "";

    try {
      const adsCreate = await Product.create(req.body);
      adsCreate.save();
      return res.redirect("/");
    } catch (err) {
      console.log("err", err);
      return res.render("auth/sells", {
        errorMessage: `Erro ao criar Anuncio: ${err}`
      });
    }
  }
);

router.get("/auth/myAdsEdit/:myAdsEditId", async (req, res, next) => {
  const ads = await Product.findById(req.params.myAdsEditId);
  return res.render("auth/myAdsEdit", ads);
});

router.post("/auth/myAdsEdit", async (req, res, next) => {
  try {
    const adsEdited = await Product.findByIdAndUpdate(req.query.id, req.body);
    return res.redirect("/ads/auth/myAds");
  } catch (err) {
    return res.render("myAdsEdit", {
      errorMessage: `Erro ao editar Anuncio: ${err}`
    });
  }
});

router.post("/auth/myAdsStatus", async (req, res, next) => {
  try {
    const adsEdited = await Order.findByIdAndUpdate(req.query.id, {status:req.query.status});
    return  res.redirect("/ads/auth/myAds");
  } catch (err) {
    return res.render("myAds", {
      errorMessage: `Erro ao alterar status: ${err}`
    });
  }
});

router.get("/auth/myAdsDel/:myAdsDelId", async (req, res, next) => {
  const ads = await Product.findById(req.params.myAdsDelId);
  return res.render("auth/myAdsDel", ads);
});

router.post("/auth/myAdsDel", async (req, res, next) => {
  console.log(req.query);
  try {
    const adsDeleted = await Product.findByIdAndDelete(req.query.id, req.body);
    return res.redirect("/ads/auth/myAds");
  } catch (err) {
    return res.render("myAdsDel", {
      errorMessage: `Erro ao editar Anuncio: ${err}`
    });
  }
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;

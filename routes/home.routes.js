const express = require("express");
const router = express.Router();

const Product = require("../models/product");
// const searchAllAds = require("../controllers/adsRoutes.controller");

const searchAllAds = async (req, res) => {
  try {
    const allAds = await Product.find({});
    return res.render("home", { allAds });
  } catch (err) {
    return res.render("error", { errorMessage: `Erro: ${err}!` });
  }
};

router.get("/", searchAllAds);

module.exports = router;

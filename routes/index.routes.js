const router = require("express").Router();
const nodemailer = require("nodemailer");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

module.exports = router;

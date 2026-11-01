const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/ownerController");
const cekApiKey = require("../middlewares/cekApiKey");

router.get("/", ownerController.getAllOwners);
router.post("/", cekApiKey, ownerController.createOwner);

module.exports = router;

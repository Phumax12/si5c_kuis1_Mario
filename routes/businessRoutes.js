const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
const cekApiKey = require("../middlewares/cekApiKey");

router.get("/", businessController.getAllBusinesses);
router.get("/:id", businessController.getBusinessById);
router.post("/", cekApiKey, businessController.createBusiness);
router.put("/:id", cekApiKey, businessController.updateBusiness);
router.delete("/:id", cekApiKey, businessController.deleteBusiness);

module.exports = router;
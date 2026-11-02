const express = require('express');
const router = express.Router();
const c = require('../controllers/businessController');
const cekApiKey = require('../middlewares/cekApiKey');

router.get('/', c.getAll);
router.get('/:id', c.getById);
router.post('/', cekApiKey, c.create);

module.exports = router;
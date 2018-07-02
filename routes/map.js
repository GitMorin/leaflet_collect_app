const express = require('express');
const router = express.Router();

router.get('/map', function (req, res) {
  res.render('../views/pages/map');
});

module.exports = router;

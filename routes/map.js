const express = require('express');
const router = express.Router();

router.get('/map', function (req, res) {
  res.render('../views/pages/map');
});

router.get('/new', function (req, res) {
  res.render('../views/pages/new');
});

module.exports = router;

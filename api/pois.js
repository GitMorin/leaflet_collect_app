const express = require('express');
const router = express.Router();
const queries = require('../db/queries');

// get all pois
router.get('/', (req, res) => {
  console.dir(req);
  queries.getAll()
    .then(pois => {
      res.json(pois.rows[0].row_to_json);
    })
    .catch(err => {
      console.error('Get all POI error', err);
    });
});

router.get('/last', (req, res) => {
  queries.getLatestRaw()
    .then(poi => {
      res.json(poi.rows[0].row_to_json);
    })
    .catch(err => {
      console.error('Get latest POI error', err);
    });
});

// get all pois as wkt
router.get('/wkt', (req, res) => {
  queries.getAllwkt()
    .then(pois => {
      res.json(pois);
    })
    .catch(err => {
      console.error('Get all poi as WKT error', err);
    });
});

// post new tomming
router.post('/tomming', (req, res) => {
  queries.createTomming(req.body)
  .then(tomming => {
    res.json(tomming);
  })
  .catch(function (err) {
    console.error('get tomming error ' + err);
  });
});

router.get('/tomming/:id', (req, res) => {
  queries.getTomming(req.params.id)
  .then(tomming => {
    res.json(tomming);
  })
  .catch(function (err) {
    console.error('get comment error ' + err);
  });
});

router.post('/skade', (req, res) => {
  queries.createSkade(req.body)
  .then(skade => {
    res.json(skade);
  })
  .catch(function (err) {
    console.error('get comment error ' + err);
  });
});

router.get('/skade/:id', (req, res) => {
  queries.getSkade(req.params.id)
  .then(skade => {
    res.json(skade);
  })
  .catch(function (err) {
    console.error('get comment error ' + err);
  });
});

// TODO: Error if there is not any comments to the array, this return an empty array if no records found, handle this error!
// get comments
// router.get('/comments/:id', (req, res) => {
//   queries.comments(req.params.id)
//   .then(comments => {
//     res.json(comments);
//     //res.send(comments);
//     //res.render('comments', ({ comments: comments }));
//   })
//   .catch(function (err) {
//     console.error('get comment error ' + err);
//   });
// });

// TODO: Add error handler for id does not exist
//get one poi
// if (!result.length)
// if(result.length != 0)

router.get('/:id', (req, res, next) => {
  queries.getOne(req.params.id)
    .then(poi => {
      if (poi) {
        console.log(poi);
        res.json(poi);
      } else {
        // this is not necessary because we have the middlwear already
        //res.status(404);
        //next(new Error('Not found'));
        next();
      }
    })
    .catch(err => {
      console.error('Get one id error', err);
    });
});

//TODO: This has example of validating input to be used later
// create new poi
// router.post('/', (req, res, next) => {
//   console.log(req.body.asset_type);
//   if (validPoi(req.body)) {
//     const poi = {
//       // place: req.body.place,
//       asset_type: req.body.asset_type,
//       // numbers: req.body.inputNumber,
//       geom: 'POINT(' + req.body.xCoord + ' ' + req.body.yCoord + ')',
//     };
//     queries.create(poi)
//       //.then(console.log('hepp'))
//     .then(res.redirect('/map'))
//     //   res.json(poi[0]);
//     //  })
//     .catch(err => {
//       console.error('New poi error', err);
//     });
//   } else {
//     next(new Error('Post - Invalid poi'));
//   }
// });

router.post('/', (req, res, next) => {
  console.log(req.body.asset_type);
  const poi = {
    // place: req.body.place,
    asset_type: req.body.asset_type,
    // numbers: req.body.inputNumber,
    geom: 'POINT(' + req.body.xCoord + ' ' + req.body.yCoord + ')',
  };
  queries.create(poi)
    //.then(console.log('hepp'))
  .then(res.redirect('/map'))
  //   res.json(poi[0]);
  //  })
  .catch(err => {
    console.error('New poi error', err);
  });
});

// update pois
router.put('/:id', isValidId, (req, res) => {
  if (validPoi(req.body)) {
    queries.update(req.params.id, req.body)
    .then(pois => {
      res.json(pois[0]);
    })
    .catch(err => {
      console.error('Update POI error', err);
    });
  } else {
    next(new Error('Invalid poi'));
  }
});

// update skader
router.put('/skade/:id', (req, res) => {
  queries.updateSkade(req.params.id, req.body)
  .then(skade => {
    res.json(skade[0]);
  })
  .catch(err => {
    console.error('Update POI error', err);
  });
});

// delete poi
router.delete('/:id', isValidId, (req, res) => {
  queries.delete(req.params.id)
  .then(() => {
    res.json({
      deleted: true,
    });
  })
  .catch(err => {
    console.error('Delete poi error', err);
  });
});

// Middlewear check if id is valid
function isValidId(req, res, next) {
  if (!isNaN(req.params.id)) return next();
  next(new Error('Invalid ID'));
}

// function validPoi(poi) {
//   // if the place a string and does not have a value inside of it
//   const hasPlace = typeof poi.place == 'string' && poi.place.trim() != '';
//   // const hasComment = typeof poi.comments == 'string' && poi.comments.trim() != '';
//   const hasNumber = typeof poi.number != 'undefined' &&
//   !isNaN(Number(poi.number));
//   //const hasNumber = typeof poi.numbers == 'string' && poi.numbers.trim() != '';
//   return hasPlace && hasNumber;
// }

// function validPoi(poi) {
//   // if the place a string and does not have a value inside of it
//   const asset_type = typeof poi.asset_type == 'string'
//   //const hasNumber = typeof poi.numbers == 'string' && poi.numbers.trim() != '';
//   return asset_type;
// }

module.exports = router;

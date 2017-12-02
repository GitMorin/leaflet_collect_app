// this is a route file that will list all the pois
// the query to the database is inside the queries file!

const express = require('express');

const router = express.Router();

// give us access to the queries file
const queries = require('../db/queries')

// Middlewear check if id is valid
function isValidId(req, res, next){
  if(!isNaN(req.params.id)) return next();
  next(new Error('Invalid ID'));
}

function validPoi(poi){
  // if the place a string and does not have a value inside of it
  const hasPlace = typeof poi.place == 'string' && poi.place.trim() != '';
  const hasComment = typeof poi.comments == 'string' && poi.comments.trim() != '';
  const hasNumber = !isNaN(poi.numbers);
  //const hasNumber = typeof poi.numbers == 'string' && poi.numbers.trim() != '';
  return hasPlace && hasComment && hasNumber;
}

// get all pois
router.get('/', (req, res) => {
  queries.getAll()
    .then(pois => {
      res.json(pois);
    });
});

// get one poi
router.get('/:id', isValidId, (req, res, next) => {
  queries.getOne(req.params.id)
    .then(poi => {
      if(poi) {
        res.json(poi);
      } else {
        //res.status(404);
        next()
      }
    })
});

// // create new poi
// router.post('/', (req, res, next) => {
//   if(validPoi(req.body)) {
//     queries.create(req.body).then(poi => {
//       res.json(poi[0]);
//     });
//     // insert into db
//   } else {
//     next(new Error('Invalid poi, ha!'))
//   }
// });

// TODO: Bring router with validation back to live when the create new poi file is complete


// create new poi
router.post('/', (req, res, next) => {
    queries.create(req.body).then(poi => {
      res.json(poi[0]);
    });
});

// update pois
router.put('/:id', isValidId, (req, res, next) => {
  if(validPoi(req.body)){
    // update poi
    // id to update, body to update with
    queries.update(req.params.id, req.body).then(pois => {
        res.json(pois[0]);
      })
    } else {
      next(new Error('Invalid poi'));
    }
});

// delete poi
router.delete('/:id', isValidId, (req, res) => {
  // delete poi
  queries.delete(req.params.id).then(() => {
    res.json({
      deleted: true
    });
  });
});

module.exports = router;

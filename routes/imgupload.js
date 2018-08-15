const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const queries = require('../db/queries');

// Set Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  // does not work
  limits:{fileSize: 1000000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb)
  }
}).single('myImage');

// check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Post image and update image to db
router.post('/', function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      res.render('../views/pages/map', {
        msg: err
      });
    } else {
      if(req.file == undefined){
        res.render('../views/pages/map', {
          msg: 'Error: No File Selected'
        });
      } else {
        queries.updateImgName(303, req.file.filename)
        .then(function() {
          res.render('../views/pages/map', {
            msg: 'File Uploaded!',
            file: `uploads/${req.file.filename}`
          });
          //need error handling here if db was not updated
        })
      }
    }
  });
});

// router.post('/', function (req, res) {
//   upload(req, res, function (err) {
//     if (err) {
//       res.render('../views/pages/map', {
//         msg: err
//       });
//     } else {
//       if(req.file == undefined){
//         res.render('../views/pages/map', {
//           msg: 'Error: No File Selected'
//         });
//       } else {
//         // send id as params and then send the filename and id to another updata route?
//         // Or, make this a put request instead seem to make more senese
//         // call queries update and update poi with file name
//         // then... set img src...
//         res.render('../views/pages/map', {
//           msg: 'File Uploaded!',
//           file: `uploads/${req.file.filename}`
//         });
//       }
//     }
//   });
// });

// update pois
// router.put('/:id', (req, res) => {
//   queries.update(req.params.id, req.body)
//     .then(pois => {
//       res.json(pois[0]);
//     })
//     .catch(err => {
//       console.error('Update POI error', err);
//     });
// });

module.exports = router;

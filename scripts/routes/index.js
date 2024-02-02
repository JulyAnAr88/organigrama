const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Organigrama' });
});

/* if (typeof document !== "undefined") {
  // 👉️ can use document here
  console.log('You are on the browser')

  console.log(document.title)
  console.log(document.getElementsByClassName('my-class'));
} else {
  // 👉️ can't use document here
  console.log('You are on the server')
} */


module.exports = router;

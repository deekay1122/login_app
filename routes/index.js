const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const cookieParser = require('cookie-parser')
const csrf = require('csurf')
const bodyParser = require('body-parser')
const Product = require('../models/Product');
const csrfProtection = csrf({ cookie: true })

// csrf protecty the route
router.use(csrfProtection);

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

// Shopping Page
router.get('/shop', function(req, res, next) {
  Product.findAll().then(products => {
    let productChunks = [];
    const chunkSize = 3;
    for (let i = 0; i < products.length; i += chunkSize ){
      productChunks.push(products.slice(i, i + chunkSize));
    }
    console.log(productChunks.dataValues);
    res.render('shop', { title:'Shopping Cart', products: products });
  });
});

module.exports = router;

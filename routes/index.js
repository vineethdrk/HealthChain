const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
var PatientBlock = require('../models/PatientBlock')
var DoctorBlock = require('../models/DoctorBlock')

var User = require('../models/User')

var crypyoUtils = require('../cryptolib/cryptoUtils')
var SHA256 = require('js-sha256')
var eccrypto = require("eccrypto");
var decrypt = function (k, d) { return "debug" }

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  if (req.user.category === "Doctor") {
    res.render('drdashboard', {
      user: req.user
    })
  } else {
    res.render('dashboard', {
      user: req.user
    })
  }
}
);
router.get('/dr/dashboard', ensureAuthenticated, (req, res) =>
  res.render('drdashboard', {
    user: req.user
  })
);
router.get('/patientblock', ensureAuthenticated, (req, res) => {
  PatientBlock.find({}, function (err, doc) {
    res.json(doc)
  })
});
router.get('/patientblock/:address', ensureAuthenticated, (req, res) => {
  PatientBlock.find({ "blockData.address": req.params.address }, function (err, doc) {
    res.json(doc)
  })
});
router.get('/dr/patientblock/', ensureAuthenticated, (req, res) => {
  var c = req.user.cryptoData
  PatientBlock.find({ "blockData.assignedTo": c.address }, function (err, doc) {
    doc.map((item, index) => {
      var encrypted = item.blockData.ptDebug;
      decrypt(c.private_key, encrypted)
    })
    res.json(doc)
  })
});

router.get('/doctorlist/', ensureAuthenticated, (req, res) => {
  User.find({ category: "Doctor" }, { "cryptoData.private_key": 0, "password": 0, "email": 0, }, function (err, doc) {

    res.json(doc)
  })
});

router.post('/patientblock', ensureAuthenticated, (req, res) => {
  var public_key = req.body.doctor;
  var file = req.body.file;
  var fileName = req.body.fileName;
  var c = req.user.cryptoData;

  eccrypto.encrypt(Buffer.from(public_key, 'hex'), Buffer.from(file)).then(function (encrypted) {
    var blockData = {
      encryptedDoc: JSON.stringify(encrypted),
      assignedTo: crypyoUtils.publicKeyToAddress(public_key),
      previousHash: "prevhash",
      publicKey: c.public_key,
      address: c.address,
      signature: crypyoUtils.signData(file, c.private_key),
      timeStamp: Date.now(),
      ptDebug: file,
      fileName,
    }
    newBlock = new PatientBlock({ blockData, blockHash: SHA256(JSON.stringify(blockData)) })
    newBlock.save()
      .then(user => {
        res.json({ status: true, msg: "done" })
      })
  });
});
router.get('/doctorblock', ensureAuthenticated, (req, res) => {
  DoctorBlock.find({}, function (err, doc) {
    res.json(doc)
  })
});
router.get('/doctorblock/:key', ensureAuthenticated, (req, res) => {
  DoctorBlock.find({}, function (err, doc) {
    res.json(doc)
  })
});
router.post('/doctorblock', ensureAuthenticated, (req, res) => {
  var public_key = req.body.sendTo;
  var file = req.body.file;
  var fileName = req.body.fileName;
  var c = req.user.cryptoData;

  eccrypto.encrypt(Buffer.from(public_key, 'hex'), Buffer.from(file)).then(function (encrypted) {
    var blockData = {
      encryptedDoc: JSON.stringify(encrypted),
      sendTo: crypyoUtils.publicKeyToAddress(public_key),
      previousHash: "prevhash",
      publicKey: c.public_key,
      address: c.address,
      signature: crypyoUtils.signData(file, c.private_key),
      timeStamp: Date.now(),
      ptDebug: file,
      fileName,
    }
    newBlock = new DoctorBlock({ blockData, blockHash: SHA256(JSON.stringify(blockData)) })
    newBlock.save()
      .then(user => {
        res.json({ status: true, msg: "done" })
      })
  });
});

module.exports = router;

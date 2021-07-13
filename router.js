'use strict';

const express = require('express');
const router = express.Router();
const docModel = require('./docModel');
const DataCollection = require('./dataClass');
const doctor = new DataCollection(docModel);
// const validator = require('../middleware/validator');

router.get('/', getDoctors);
// router.get('/:id', getFood);
router.post('/', createDoctor);


async function getDoctors(req, res, next) {
  try {
    const id = req.params.id;
    const doctors = await doctor.read(id);
    res.json({ doctors });
  } catch (e) {
    next(e);
  }
}

async function createDoctor(req, res, next) {
  try {
    const data = req.body;
    const newDoc = await doctor.create(data);
    res.json(newDoc);
  } catch (e) {
    next(e);
  }
}

module.exports = router;
'use strict';

const mongoose = require('mongoose');


const docSchema = mongoose.Schema({
  docName:{type:String}
})

const docModel = mongoose.model('doctor',docSchema)

module.exports = docModel;
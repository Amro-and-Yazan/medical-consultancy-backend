'use strict';

class DataCollection {
  constructor(model) {
    this.model = model;
  }

  create(obj) {
    const doc = new this.model(obj);
    doc.save();
  }

  read(docName) {
    if (docName) {
      return this.model.find({ docName:docName });
    }
  }

}

module.exports = DataCollection;
/* eslint-disable no-unused-vars */
const validate = require('validate.js');
const joi2json = require('../../utils/joi2json');
const { GeneralError } = require('@feathersjs/errors');
class Service {
  constructor (options) {
    this.options = options || {};
    this.app = options.app;
  }

  async find (params) {
    try {
      const data = [];
      Object.keys(this.app.docs.paths).forEach(path => {
        const name = path.substring(1);
        const validators = this.app.get(`validators-${name}`);
        const createValidators = validators && validators.withoutRequired;
        const jsonSchema = createValidators && joi2json(createValidators);
        if(jsonSchema){
          data.push({
            name,
            schema: jsonSchema
          });
        }
      });
      return {
        'total': data.length,
        'data': data
      };
    } catch (error) {
      throw new GeneralError(); 
    }
  }

  async get (id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }

  async update (id, data, params) {
    return data;
  }

  async patch (id, data, params) {
    return data;
  }

  async remove (id, params) {
    return { id };
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;

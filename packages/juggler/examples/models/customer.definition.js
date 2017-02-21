var Address = require('./address').Address;

module.exports = {
  name: 'Customer',
  properties: {
    id: {
      type: 'string',
      id: true
    },
    name: {
      type: string
    },
    email: {
      type: string,
      regexp: '^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$',
      required: true
    },
    address: {
      type: Address
    }
  }
};
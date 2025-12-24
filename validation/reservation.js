const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateReservationData(data) {
  let errors = {};

  data.firstname = !isEmpty(data.firstname) ? data.firstname : '';
  data.lastname = !isEmpty(data.lastname) ? data.lastname : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.phone = !isEmpty(data.phone) ? data.phone : '';
  
  if (!Validator.isLength(data.firstname, { min: 3, max: 20 })) {
    errors.firstname = 'A keresztnév minimum 3, maximum 20 karakter lehet';
  }

  if (!Validator.isLength(data.lastname, { min: 3, max: 20 })) {
    errors.lastname = 'A vezetéknév minimum 3, maximum 20 karakter lehet';
  }
  
  if (!Validator.isEmail(data.email)) {
    errors.email = 'Helytelen email';
  }

  if (!Validator.isMobilePhone(data.phone, ['hu-HU'])) {
    errors.phone = 'Helyes formátum: pl.: +36304445555';
  }
  
  return {
    errors,
    isValid: isEmpty(errors)
  };
};

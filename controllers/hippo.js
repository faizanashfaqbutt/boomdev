const request = require('request');
const config = require('../config');

class Hippo {
    getPrice(params) {
    const url = 'https://api.staging.myhippo.io/v1/herd/quote';
    let {street, city, state, postal_code, sqft, roof_year,year_built} = params;
    let is_condo = 'n', first_name = config.demoData.first_name, last_name = config.demoData.last_name;
    if(!roof_year) roof_year = (new Date).getFullYear();
    let roof_constructed = roof_year;
    const options = {
      method: 'GET',
      url: url,
      qs: {
        auth_token: config.hippo.staging.auth_token,
        street, city, state, zip: postal_code, is_condo,
        first_name, last_name,sqft,roof_constructed,year_built
      },
      headers: {accept: 'text/plain'}
    };

    return new Promise((resolve, reject) => {
      request(options, function (error, response, body) {
        if (error) reject({success: false, msg: error})
        else resolve({success: true, data: body});
      });
    });
  }
}

module.exports = Hippo;

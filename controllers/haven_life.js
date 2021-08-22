const request = require('request');
const config = require('../config');

class HavenLife {
  generateToken(params) {
    const url = 'https://quotes-v3.havenlife.com/quote/coverage';
    let {state, dateOfBirth, gender, coverageAmount} = params;
    if (coverageAmount > 500000) coverageAmount = 500000;

    const qs = {
      coverageAmount, dateOfBirth, gender, state,
      healthCategory: 'fair',
      isSmoker: true,
      productIdentifier: 'HavenTermSI',
      termLength: 20,
      includeWaiverPremium: false
    };
    console.log(config.haven.source, 'qs');
    const options = {
      url, qs, method: 'GET',
      headers: {
        'accept': 'application/json',
        'Source': config.haven.source
      }
    };
    return new Promise((resolve, reject) => {
      request(options, function (error, response, body) {
        if (error) {
          reject({result: 'error'});
        } else {
          resolve(body);
        }
      });
    });
  }
}

module.exports = HavenLife;

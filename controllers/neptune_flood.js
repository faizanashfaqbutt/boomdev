const fs = require('fs');
const request = require('request');
const config = require('../config');

class NeptuneFlood {
  async getToken() {
    if (!fs.existsSync(this.tokenPath('../config'))) {
      fs.writeFileSync(this.tokenPath(), '');
    }
    const fileContent = fs.readFileSync(this.tokenPath());
    if (fileContent.length > 0) {
      const tokenInfo = JSON.parse(fileContent);
      const duration = tokenInfo.duration, created_at = tokenInfo.created_at;
      const current_time = +new Date();
      if (current_time > created_at + duration) {
        await this.generateToken();
      }
    } else {
      await this.generateToken();
    }
    let tokenData = JSON.parse(fs.readFileSync(this.tokenPath()));
    return tokenData.token;
  }

  tokenPath() {
    return './config/neptune_token.txt';
  }

  generateToken() {
    const neptuneConfig = config.neptune;
    return new Promise((resolve, reject) => {
      const options = {
        'method': 'GET',
        'url': neptuneConfig.host + '/api/v3/auth/getToken',
        'headers': {
          'Content-Type': 'application/json',
          'Authorization': neptuneConfig.key
        }
      };
      request(options, (error, response) => {
        if (error) reject(error);
        if (!response) reject(error);
        this.updateToken(response.body);
        resolve(response.body);
      });
    });
  }

  updateToken(token) {
    const duration = 24 * 3600 * 1000;
    const created_at = +new Date();
    fs.writeFileSync(this.tokenPath(), JSON.stringify({duration, created_at, token}));
  }

  async createQuote(params) {
    let {
      city, state, postal_code, street, year_built
    } = params;
    const deductible = 5000;
    const date = new Date();
    date.setDate(date.getDate()+7);
    const effectiveDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    const neptuneConfig = config.neptune;
    const token = await this.getToken();
    const data = {
      "agentNo": neptuneConfig.username,
      "password": neptuneConfig.password,
      "isDirectToConsumer": false,
      "application": {
        "addr1": street,
        "addr2": null,
        "city": city,
        "state": state,
        "zip": postal_code,
        "yearBuilt": year_built,
        "deductible": deductible,
        "hasImmediateClosing": false,
        "effectiveDate": `${effectiveDate} 0:0:00 AM`,
        "hasEC": false,
        "elevation": null,
        "claims": "",
        "basementConstruction": "",
        "occupancy": "",
        "foundationType": "",
        "constructionType": "",
        "propertyType": "",
        "numberOfSteps": "",
        "numberOfStories": 1,
        "condoFloor": 0,
        "buildingCoverage": 250000,
        "contentCoverage": 100000,
        "basementCoverage": 0,
        "poolCoverage": 0,
        "unattachedStructureCoverage": "",
        "hasOptionalTemporaryLivingExpenses": false,
        "hasOptionalReplacementCost": false,
        "firstName": config.demoData.first_name,
        "lastName": config.demoData.last_name,
        "email": config.demoData.email,
        "phone": config.demoData.phone,
        "coApplicantFirstName": null,
        "coApplicantLastName": null,
        "isMailingSameAsProperty": false,
        "mailingAddr1": null,
        "mailingAddr2": null,
        "mailingCity": null,
        "mailingState": null,
        "mailingZip": null,
        "billInitial": "insured",
        "billOnRenewal": "insured",
        "deliveryMethod": "electronic"
      }
    };
    const options = {
      'method': 'POST',
      'url': neptuneConfig.host + '/api/v3/rater/quotes',
      'dataType': 'JSON',
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      'body': JSON.stringify(data)
    };

    return new Promise((resolve, reject) => {
      request(options, function (error, response) {
        if (error) reject(error);
        let data;
        try {
          data = JSON.parse(response.body);
        } catch (e) {
          data = response && response.body;
        }
        resolve(data);
      });
    });
  }
}

module.exports = NeptuneFlood;

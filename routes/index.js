let express = require("express");
let router = express.Router();
let config = require("../config");
var unirest = require("unirest");
let User = require("../models/User.js");
const nodeZillow = require("node-zillow");
const zillow = new nodeZillow(config.zillow_api);
const sgMail = require("@sendgrid/mail");
const PDFDocument = require("pdfkit");
const parseString = require("xml2js").parseString;
const dateFormat = require("dateformat");
const swig = require("swig");
const path = require("path");
const soap = require("strong-soap").soap;
const XMLHandler = soap.XMLHandler;
const xmlHandler = new XMLHandler();
const appDir = path.dirname(require.main.filename);
const NeptuneFlood = require("../controllers/neptune_flood");
const HavenLife = require("../controllers/haven_life");
const Hippo = require("../controllers/hippo");
const Pdf = require("../controllers/pdf");
const { v4: uuidv4 } = require("uuid");
const commonTemplate = require("../templates/common_template");
swig.setDefaults({
  loader: swig.loaders.fs(__dirname + "/apiTemplates"),
});

let fs = require("fs");

const request = require("request");
const emailHeader = commonTemplate.emailHeader;
const emailFooter = commonTemplate.emailFooter;

sgMail.setApiKey(config.sendgrid);

const nodemailer = require("nodemailer");
const { parse } = require("ts-node");
const { consoleTestResultHandler } = require("tslint/lib/test");
// SMTP settings
let transporter = nodemailer.createTransport({
  host: "email-smtp.us-east-1.amazonaws.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'AKIATLLLZDV4KTA3KNWJ', // generated ethereal user
    pass: 'BEHn+YT2OxRLHHOjuI684clmzCCmIIcNQvC099t4aIPb', // generated ethereal password
  },
});

let mailFrom = "homehelp@apply.insure";

/* GET ALL Zillow data*/
router.post("/get_zillow", async function (req, response, next) {
  let { address, citystatezip } = req.body;

  try {
    if (address) {
      var req = unirest("GET", config.RealtorConfig.endpoint.location_lookup);

      req.query({
        input: address + "," + citystatezip,
      });

      req.headers(setRapidApiHeader());

      await req.end(async function (res) {
        if (!res.error) {
          // throw new Error(res.error);
          const { mpr_id } = (res.body.autocomplete && res.body.autocomplete[0]) || null;
          return getPropertyInfo(mpr_id)
            .then((val) => {
              response.send(val);
            })
            .catch(() => {
              response.send(null);
            });
        }
        response.send(res);
      });
    } else {
      response.send(null);
    }
  } catch (err) { }
});

function prepare_stillwater_params(params) {
  var policytypeCd = "03";

  params['api_type'] = typeof params['api_type'] != "undefined" ? params['api_type'] : "homeowner";
  if (params['api_type'] == "homeowner") {
    policytypeCd = "03";
  } else {
    policytypeCd = "06";
  }
  let {
    city,
    state,
    postal_code,
    street,
    email,
    phone,
    year_built,
    sqft,
    mode,
    ac_year,
    electric_year,
    plumbing_year,
    roof_year,
    construction_type,
    roof_type,
    dwell_coverage,
    personData,
    building_type,
    roof_status,
    exterior_type,
    is_basement,
    foundation_type,
    smoke_alarm,
    central_fire_alarm,
    deadbolt_locks,
    central_bulgar_alarm,
    bundle_discount,
    effective_date,
    expiration_date,
    is_demo,
    mortgage,
    mortgage_name,
    mortgage_street,
    mortgage_city,
    mortgage_state,
    mortgage_postal_code,
  } = params;
  !dwell_coverage ? (dwell_coverage = 25000) : "";
  let now = new Date();
  if (!effective_date || !expiration_date) {
    effective_date = dateFormat(now, "yyyy-mm-dd");
    let pre_format_expiration_date = new Date(effective_date).getFullYear() + 1 + "-" + (new Date(effective_date).getMonth() + 1) + "-" + new Date(effective_date).getDate();
    expiration_date = dateFormat(pre_format_expiration_date, "yyyy-mm-dd");
  }
  let commondata = commonTemplate.getCommonStillwaterParam(effective_date);
  const purchaseDt = dateFormat(now, "yyyy"),
    yearOccupancy = dateFormat(now, "yyyy");
  let firstname, lastname, birthday;
  if (is_demo) {
    personData = [
      {
        first_name: config.demoData.first_name,
        last_name: config.demoData.last_name,
        birthday: config.demoData.birthday,
      },
    ];
    email = config.demoData.email;
    phone = config.demoData.phone;
  }
  (firstname = personData[0]["first_name"]), (lastname = personData[0]["last_name"]), (birthday = personData[0]["birthday"]);
  const stateData = config.universalData.states.filter((data) => {
    return data.StateCode === state.toUpperCase();
  });
  const state_id = stateData[0]["StateId"];
  const roof_data = [-1, "ASPHS", "WOODS", "SLAT2", "RECYC", "CONC", "ASPHS", "CLAY", "ASPHS", "ASPHS"];
  roof_type = roof_data[roof_type];
  if (postal_code !== "OR" && postal_code !== "WA") {
    roof_type = "ASPHS";
  }
  const construction_data = [-1, "WoodSid", "SteelF", "StuccoM", "Pconcrete"];
  construction_type = construction_data[construction_type];
  const roofshape_data = {
    flat: "FLAT",
    peaked: "FLAT",
  };
  const foundation_data = [-1, "BS", "Crawl", "Slab", "Other"];
  foundation_type = foundation_data[foundation_type];
  const roofShapeType = roofshape_data[roof_status];
  const commonObj = {
    construction_type,
    foundation_type,
    building_type,
    roof_type,
    roofShapeType,
    exterior_type,
    smoke_alarm,
    central_fire_alarm,
    deadbolt_locks,
    central_bulgar_alarm,
    bundle_discount,
    is_basement,
    personData,
    city,
    state,
    postal_code,
    state_id,
    street,
    firstname,
    lastname,
    email,
    birthday,
    year_built,
    sqft,
    mode,
    dwell_coverage,
    ac_year,
    electric_year,
    plumbing_year,
    roof_year,
    effective_date,
    expiration_date,
    yearOccupancy,
    purchaseDt,
    phone,
    mortgage,
    mortgage_name,
    mortgage_street,
    mortgage_city,
    mortgage_state,
    mortgage_postal_code,
    policytypeCd
  };
  const stillwater_quoteTemplate = swig.compileFile(appDir + "/templates/stillwater_api_getpricing_request.xml");
  const stillwater_content = stillwater_quoteTemplate(commonObj);
  return commondata + stillwater_content;
}

function plymouth_get_pricing(requestData) {
  const { firstname, lastname, birthday, address, type } = requestData;
  const puppeteer = require("puppeteer");

  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    let isError = false;
    const detailPage = await browser.newPage({ headless: true });
    detailPage.setViewport({ width: 1920, height: 1080 });
    const url =
      "https://homeowners.plymouthrock.com/consumer/home/#/createQuote?" +
      "fullAddress=" +
      address +
      "&" +
      "policyType=" +
      type +
      "&firstName=" +
      firstname +
      "&lastName=" +
      lastname +
      "&numOfUnit=undefined&" +
      "dob=" +
      birthday +
      "&sourceOfEntry=WIDGET&agencyCode=" +
      config.plymouth.code +
      "&agencyPhoneNum=" +
      config.plymouth.phone_number +
      "&utm_campaign=IA_CV_widget&utm_content=Basicbanner";
    // console.log('__________________url_____________')
    // console.log(url)
    await detailPage.goto(url).catch((e) => {
      isError = true;
    });
    if (isError) {
      browser.close();
      reject({ result: "error", data: [] });
      return;
    }
    let data;
    await detailPage
      .waitForSelector(".plan-card-title")
      .then(async () => {
        const returnAry = await detailPage.evaluate(() => {
          function camelize(str) {
            return str
              .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
                return index == 0 ? word.toLowerCase() : word.toUpperCase();
              })
              .replace(/\s+/g, "");
          }

          let totalAry = {};
          const elems = document.getElementsByClassName("card-block");
          for (let j = 0; j < elems.length; j++) {
            let subAry = {};
            const title = $(elems[j]).children(".plan-card-title").children(0).children(".card-title")[0].innerText.toLowerCase();
            const pricing = $(elems[j]).children(".plan-card-title").children(1).children()[1].children[1].innerText;
            const benefitElem = $(elems[j]).children()[2];
            const benefits = benefitElem.children[0].children[0].children;
            subAry.pricing = pricing;
            for (let i = 0; i < benefits.length; i++) {
              try {
                const key = camelize(benefits[i].children[0].children[1].children[0].innerText);
                let benefitPrice = benefits[i].children[0].children[1].children[2].innerText;
                benefitPrice = Number(benefitPrice.replace(/[^0-9.-]+/g, ""));
                subAry[key] = benefitPrice;
              } catch (e) { }
            }
            totalAry[title] = subAry;
          }
          return totalAry;
        });
        data = { result: "success", data: returnAry };
      })
      .catch(() => {
        data = { result: "error", data: [] };
      });
    await browser.close();
    resolve(data);
  });
}

async function stillwater_get_pricing(param) {
  const options = {
    method: "POST",
    url: config.ApiInfo.HomeAPIURL,
    headers: {
      Host: "api-qua.stillwaterinsurance.com",
      Accept: "*/*",
      "Content-Type": "text/xml",
      Authorization: "Basic " + new Buffer.from(config.ApiInfo.accountName + ":" + config.ApiInfo.homeAPIToken).toString("base64"),
    },
    body: param,
  };
  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      // console.log('error', error)
      // console.log('____________________________')
      // console.log('response', response)
      // console.log('____________________________')
      // console.log('body', body)
      if (error) {
        reject({ result: "error" });
      } else {
        resolve(body);
      }
    });
  });
}

async function universal_get_pricing(params) {
  console.log('*************************')
  console.log(params)
  return new Promise((resolve, reject) => {
    soap.createClient("http://qa.atlasbridge.com/UniversalDirectRater/UDirectRating.svc?wsdl", {}, function (err, client) {
      if (!client) return reject({ result: "error", msg: "Service is not available now.", data: [] });
      const method = client["upcicLogin"];
      method(
        {
          version: "1.0",
          username: config.universalUsername,
          password: config.universalPwd,
        },
        function (err, result, envelope, soapHeader) {
          if (!result || err) {
            resolve({ success: false, err: err });
            return;
          }
          const tokenData = result["upcicLoginResult"];

          params = { ...params, tokenData };
          const quoteTemplate = swig.compileFile(appDir + "/templates/universal_api_getpricing_request.xml");
          const quoteData = quoteTemplate(params);
          const options = {
            method: "POST",
            url: "https://qa.atlasbridge.com/UniversalDirectRater/UDirectRating.svc",
            qs: { wsdl: "" },
            headers: {
              SOAPAction: "http://tempuri.org/IRatingService/upcicProcessQuote",
              "content-type": 'text/xml;charset="utf-8"',
            },
            body: quoteData,
          };
          request(options, function (error, response, body) {
            console.log('*******************************')
            console.log(body)
            if (error) reject({ result: "error" });
            resolve(body);
            fs.writeFileSync(appDir + "/templates/universal_api_process_quote_request.xml", quoteData);
          });
        }
      );
    });
  });
}

// pdf changes start

router.post("/downlod_pdf", async (req, resp, next) => {
  const { url } = req.body;

  if (url && fs.existsSync(url)) {
    //  00a31ea8-cd01-4c1c-8048-be175b99c7ae.pdf')) {
    var data = [];
    var readStream = fs.createReadStream(url);
    readStream
      .on("data", function (chunk) {
        data.push(chunk);
      })
      .on("end", function () {
        data = new Buffer.concat(data);
        resp.writeHead(200, {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=working-test.pdf",
          "Content-Length": data.length,
        });
        resp.end(data);
      });
  } else {
    resp.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Length": 0,
    });
    resp.end(data);
  }
});

router.post("/get_plymouth_pricing", async function (req, res, next) {
  let { city, state, postal_code, street, mode, personData, is_demo } = req.body;

  try {
    let firstname, lastname, birthday;

    if (is_demo) {
      personData = [
        {
          first_name: config.demoData.first_name,
          last_name: config.demoData.last_name,
          birthday: config.demoData.birthday,
        },
      ];
    }
    let insurance_type = ["HO3", "HO6"];
    (firstname = personData[0]["first_name"]), (lastname = personData[0]["last_name"]), (birthday = personData[0]["birthday"]);
    let response = {};
    let address = street + ", " + city + ", " + state + " " + postal_code;
    let type = insurance_type[mode];
    response = await plymouth_get_pricing({
      firstname,
      lastname,
      birthday,
      address,
      type,
    });
    res.json(response);
  } catch (e) {
    res.json({ result: "error", data: [] });
  }
});

/*router.post('/get_pdf_link',
    async function (req, res, next) {
        let {city, state, postal_code, street, mode, personData, is_demo} = req.body;

        try {
            const uniqueId = uuidv4();
            const {formatted_address, email, cc_email, stillwater_pricing, universal_pricing, enhanced_pricing, coverage_a} = req.body;
            let isPDFError = false;
            const params = Object.assign(req.body, {uniqueId})
            const pdf = new Pdf();
            await pdf.generateBindPDF(params).catch(() => isPDFError = true)
            if (isPDFError) {
                res.send(
                    {
                        result: 'success',
                        msg: 'An error occurred while creating invoice PDF'
                    }
                );
                return;
            }
            let pdfurl = '';
            let pdf_path = '';
            if (uniqueId) {
                let domain = req.headers.origin;
                pdfurl = domain + '/pdfs/' + uniqueId + '.pdf';
                pdf_path = './pdfs/' + uniqueId + '.pdf';
            }
            res.json(pdf_path);
        } catch (e) {
            res.json({result: 'error', data: []});
        }
    }
);*/

router.post("/get_stillwater_pricing", async function (req, res, next) {


  function fcPrepareStillwaterParams(params) {
    var policytypeCd = "03";

    params['api_type'] = typeof params['api_type'] != "undefined" ? params['api_type'] : "homeowner";
    if (params['api_type'] == "homeowner") {
      policytypeCd = "03";
    } else {
      policytypeCd = "06";
    }
    let {
      city, state, postal_code, street, dwell_coverage, personData, deductible,
      bundle_discount, effective_date, is_demo
    } = params;

    if (!dwell_coverage) {
      dwell_coverage = 25000
    }

    let now = new Date();
    if (!effective_date) {
      effective_date = dateFormat(now, "yyyy-mm-dd");
    }
    let commondata = commonTemplate.getCommonStillwaterParam(effective_date);

    let firstname, lastname
    if (is_demo) {
      personData = [
        {
          first_name: config.demoData.first_name,
          last_name: config.demoData.last_name,
          birthday: config.demoData.birthday,
        },
      ];
      email = config.demoData.email;
      phone = config.demoData.phone;
    }
    (firstname = personData[0]["first_name"]), (lastname = personData[0]["last_name"]), (birthday = personData[0]["birthday"]);
    const stateData = config.universalData.states.filter((data) => {
      return data.StateCode === state.toUpperCase();
    });
    const state_id = stateData[0]["StateId"];

    const commonObj = {

      bundle_discount, personData, deductible,
      city, state, postal_code, state_id, street, firstname, lastname, dwell_coverage,
      effective_date,
      policytypeCd
    };
    const stillwater_quoteTemplate = swig.compileFile(appDir + "/templates/stillwater_api_getpricing_request.xml");
    const stillwater_content = stillwater_quoteTemplate(commonObj);
    return commondata + stillwater_content;
  }
  const fcParam = req.body;

  const basic = {
    city: fcParam.city,
    state: fcParam.state,
    postal_code: fcParam.postal_code,
    street: fcParam.street,
    dwell_coverage: parseInt(fcParam.basic.dwelling) || 25000,
    deductible: parseInt(fcParam.basic.deductible) || 1000,
    personData: fcParam.personData,
    bundle_discount: fcParam.bundle_discount,
    effective_date: fcParam.effective_date,
    is_demo: fcParam.is_demo

  }
  const better = {
    ...basic, dwell_coverage: parseInt(fcParam.better.dwelling) || 25000, deductible: parseInt(fcParam.better.deductible) || 1000,
  }

  const best = {
    ...basic, dwell_coverage: parseInt(fcParam.best.dwelling) || 25000, deductible: parseInt(fcParam.best.deductible) || 1000,
  }


  const basicParam = fcPrepareStillwaterParams(basic);
  const betterParam = fcPrepareStillwaterParams(better);
  const bestParam = fcPrepareStillwaterParams(best);

  let finalResponse = {
    result: "success",
    result: "error",
    msg: "An error occurred. Please try again later.",
    data: {}
  }

  // try {
  //   let response = await stillwater_get_pricing(basicParam);
  //   finalResponse['data']['basic'] = xmlHandler.xmlToJson(null, response, null);
  //   finalResponse['result'] = "success"
  //   finalResponse['msg'] = "One of three worked"
  // } catch (e) {
  //   finalResponse['data']['basic'] = null
  // }
  // try {
  //   let response = await stillwater_get_pricing(betterParam);
  //   finalResponse['data']['better'] = xmlHandler.xmlToJson(null, response, null);
  //   finalResponse['result'] = "success"
  //   finalResponse['msg'] = "One of three worked"
  // } catch (e) {
  //   finalResponse['data']['better'] = null
  // }
  // try {
  //   let response = await stillwater_get_pricing(bestParam);
  //   finalResponse['data']['best'] = xmlHandler.xmlToJson(null, response, null);
  //   finalResponse['result'] = "success"
  //   finalResponse['msg'] = "One of three worked"
  // } catch (e) {
  //   finalResponse['data']['best'] = null
  // }





  try {
    let response = await stillwater_get_pricing(basicParam);
    console.log(basicParam)
    finalResponse['data'] = xmlHandler.xmlToJson(null, response, null);
    finalResponse['basic'] = xmlHandler.xmlToJson(null, response, null)['ACORD']['InsuranceSvcRs']['HomePolicyQuoteInqRs']['PolicySummaryInfo']['FullTermAmt']['Amt']
    finalResponse['result'] = "success"
    finalResponse['msg'] = "One of three worked"
  } catch (e) {
    console.log('e_______', e)
    finalResponse['data']['basic'] = null
  }
  try {
    let response = await stillwater_get_pricing(betterParam);
    finalResponse['data'] = xmlHandler.xmlToJson(null, response, null);
    finalResponse['better'] = xmlHandler.xmlToJson(null, response, null)['ACORD']['InsuranceSvcRs']['HomePolicyQuoteInqRs']['PolicySummaryInfo']['FullTermAmt']['Amt']

    finalResponse['result'] = "success"
    finalResponse['msg'] = "One of three worked"
  } catch (e) {
    console.log('e_______', e)
    finalResponse['data']['better'] = null
  }
  try {
    let response = await stillwater_get_pricing(bestParam);
    finalResponse['data'] = xmlHandler.xmlToJson(null, response, null);
    finalResponse['best'] = xmlHandler.xmlToJson(null, response, null)['ACORD']['InsuranceSvcRs']['HomePolicyQuoteInqRs']['PolicySummaryInfo']['FullTermAmt']['Amt']

    finalResponse['result'] = "success"
    finalResponse['msg'] = "One of three worked"
  } catch (e) {
    finalResponse['data']['best'] = null
    console.log('e_______', e)
  }


  res.json({ ...finalResponse });


  // let response = {},
  //   stillwater_data;
  // try {
  //   stillwater_data = await stillwater_get_pricing(basicParam);
  //   // console.log("response: ", stillwater_data);
  //   response = xmlHandler.xmlToJson(null, stillwater_data, null);
  //   if (response) {
  //     res.json({ data: response, result: "success" });
  //   }
  // } catch (e) {
  //   // console.log(e);
  //   res.json({
  //     data: [],
  //     result: "error",
  //     msg: "An error occurred. Please try again later.",
  //   });
  // }
});
router.post("/get_universal_pricing", async function (req, res, next) {
  async function getUniversalData(params) {

    // console.log('______________________')
    // console.log(params)
    let {
      city,
      state,
      postal_code,
      street,
      email,
      phone,
      year_built,
      sqft,
      mode,
      ac_year,
      electric_year,
      plumbing_year,
      roof_year,
      construction_type,
      roof_type,
      dwell_coverage,
      personData,
      building_type,
      roof_status,
      exterior_type,
      is_basement,
      foundation_type,
      smoke_alarm,
      central_fire_alarm,
      deadbolt_locks,
      central_bulgar_alarm,
      bundle_discount,
      is_demo,
    } = params;
    !dwell_coverage ? (dwell_coverage = 25000) : "";
    let now = new Date(),
      effective_date = dateFormat(now, "yyyy-mm-dd");
    let pre_format_expiration_date = new Date(effective_date).getFullYear() + 1 + "-" + (new Date(effective_date).getMonth() + 1) + "-" + new Date(effective_date).getDate();
    let expiration_date = dateFormat(pre_format_expiration_date, "yyyy-mm-dd");
    const purchaseDt = dateFormat(now, "yyyy"),
      yearOccupancy = dateFormat(now, "yyyy");
    let firstname, lastname, birthday;
    if (is_demo) {
      personData = [
        {
          first_name: config.demoData.first_name,
          last_name: config.demoData.last_name,
          birthday: config.demoData.birthday,
        },
      ];
      email = config.demoData.email;
      phone = config.demoData.phone;
    }
    (firstname = personData[0]["first_name"]), (lastname = personData[0]["last_name"]), (birthday = personData[0]["birthday"]);
    const stateData = config.universalData.states.filter((data) => {
      return data.StateCode === state.toUpperCase();
    });
    const state_id = stateData[0]["StateId"];
    const roof_data = [-1, 15001, 15013, 15003, 15009, 15006, 15001, 15008, 15004, 15001];
    roof_type = roof_data[roof_type];
    const construction_data = [-1, "Frame", -1, "Masonry", -1];
    construction_type = construction_data[construction_type];
    const roofshape_data = {
      flat: "Flat",
      peaked: "Gable",
    };
    const foundation_data = [-1, "Basement", "Crawl Space", "Slab", -1];
    foundation_type = foundation_data[foundation_type];
    const roofShapeType = roofshape_data[roof_status];
    const commonObj = {
      construction_type,
      foundation_type,
      building_type,
      roof_type,
      roofShapeType,
      exterior_type,
      smoke_alarm,
      central_fire_alarm,
      deadbolt_locks,
      central_bulgar_alarm,
      bundle_discount,
      is_basement,
      personData,
      city,
      state,
      postal_code,
      state_id,
      street,
      firstname,
      lastname,
      email,
      birthday,
      year_built,
      sqft,
      mode,
      dwell_coverage,
      ac_year,
      electric_year,
      plumbing_year,
      roof_year,
      effective_date,
      expiration_date,
      yearOccupancy,
      purchaseDt,
      phone,
    };
    let response, universal_data;
    if (construction_type !== -1 && roof_type !== -1 && foundation_type !== -1) {
      try {
        universal_data = await universal_get_pricing(commonObj);
        let convertedUniversalData = xmlHandler.xmlToJson(null, universal_data, null);
        let universalResponseData = convertedUniversalData["Body"]["upcicProcessQuoteResponse"]["upcicProcessQuoteResult"];
        if (convertedUniversalData && universalResponseData) {
          response = xmlHandler.xmlToJson(null, universalResponseData, null);
          response = { ...response, result: "success" };
          return {
            data: response,
            result: "success"
          }
          // res.json({
          //   data: response,
          //   result: "success",
          // });
        } else {
          return {
            data: [],
            result: "error",
            msg: "An error occurred. Please try again later.",
          }
          // res.json({
          //   data: [],
          //   result: "error",
          //   msg: "An error occurred. Please try again later.",
          // });
        }
      } catch (e) {
        return {
          data: [],
          result: "error",
          msg: "An error occurred. Please try again later.",
        }
        // res.json({
        //   data: [],
        //   result: "error",
        //   msg: "An error occurred. Please try again later.",
        // });
      }
    } else {
      return {
        data: [],
        result: "error",
        msg: "Please select the correct data.",
      }
      // res.json({
      //   data: [],
      //   result: "error",
      //   msg: "Please select the correct data.",
      // });
    }
  }

  let allParams = req.body
  const basicCoverage = parseInt(req.body?.basic?.dwelling) || 25000
  const betterCoverage = parseInt(req.body?.better?.dwelling) || 25000
  const bestCoverage = parseInt(req.body?.best?.dwelling) || 25000

  //sending request for basic
  allParams.dwell_coverage = basicCoverage;
  const basicResponse = await getUniversalData(allParams)

  allParams.dwell_coverage = betterCoverage;
  const betterResponse = await getUniversalData(allParams)

  allParams.dwell_coverage = bestCoverage;
  const bestResponse = await getUniversalData(allParams)

  let result = "error"
  if (basicResponse.result === 'success' || betterResponse.result === 'success' || bestResponse.result === 'success') {
    result = "success"
  }
  // res.json({ ...bestResponse })
  res.json({ result: result, basic: basicResponse, better: betterResponse, best: bestResponse })

});

router.post("/get_neptuneflood", async function (req, res, next) {
  const neptune = new NeptuneFlood();
  let apiResponse = await neptune.createQuote(req.body),
    data = {},
    result;
  try {
    result = "success";
    data["zone"] = apiResponse["application"]["floodZone"];
    data["premium"] = apiResponse["policy"]["totalPremium"];
  } catch (e) {
    result = "error";
  }
  res.json({ result, data });
});

router.post("/get_hippo", async function (req, res, next) {
  const neptune = new Hippo();
  await neptune
    .getPrice(req.body)
    .then((e) => {
      res.send(e);
    })
    .catch((e) => {
      res.send(e);
    });
});

router.post("/get_havenlife", async function (req, res, next) {
  const havenLife = new HavenLife();
  const data = await havenLife.generateToken(req.body);
  res.send(data);
});
/*
 *  Action: This will trigger after user clicked "next" button in the home page
 * User info, low price, high price, bind now price will be saved into database and email to admin and user
 * If user select and enter their handoff information, email to receiver that he entered and save the information into database
 * isGooglePlace: boolean (If user entered their address information using Google Places Api, it will be set to true, otherwise false)
 * */
router.post("/save_user_data", async function (req, res, next) {
  let { quote_id } = req.body;
  User.find({ quote_id }, (err, user) => {
    if (err) {
      res.send({ result: "error", msg: "An error occurred while while saving data" });
    }
    let userData;
    if (user.length > 0) {
      userData = user[0];
    } else {
      userData = new User();
    }
    Object.assign(userData, req.body);
    userData.save();
    res.send({ result: "success", quote_id });
  });
});

/*Action "bind now" button
 * scrape data that will be provided from API and update database "bind_now" to true
 * And email to receiver that user entered
 * */
router.get("/bind_now/:uniqueId", function (req, res, next) {
  let uniqueId = req.params["uniqueId"];
  User.find(
    {
      quote_id: uniqueId,
    },
    function (err, user) {
      if (err) {
        res.render("error");
      } else {
        let data = user[0];
        if (data) {
          data.bind_now = true;
          data.save();
          let isGooglePlace = true;

          if (data["city"] == "" || data["state"] == "" || data["zip"] == "") {
            isGooglePlace = false;
          }
          const first_name = data["personData"][0]["first_name"];
          const last_name = data["personData"][0]["last_name"];
          sendBindEmail(data["quote_id"], first_name, last_name, data["email"], isGooglePlace, data["address"], data["city"], data["state"], data["zip_code"], data["low_price"], data["high_price"], data["bind_now_price"]).then(function () {
            //res.send({header: 300, location: '/policy'});
            res.send({ result: "success" });
          });
        } else {
          res.send({ result: "error" });
        }
      }
    }
  );
});

/*Email to receiver*/

function sendBindEmail(quote_id, first_name, last_name, email, isGooglePlace, address, city, state, zip, low_price, high_price, bind_now_price) {
  return new Promise((resolve, reject) => {
    let now = new Date();
    let date_entered = now.getMonth() + 1 + "/" + now.getDate() + "/" + now.getFullYear();
    let subject = "User - " + address + " - " + first_name + " " + last_name;
    let html = emailHeader;
    html +=
      "<tr>\n" +
      '      <td mc:edit="block_25" style="padding:0 0 29px; font-family: Verdana, Geneva,sans-serif;">\n' +
      '        <h3 style="color: #2196f3; text-align: center">User Started Bind Now</h3>\n' +
      "      </td>\n" +
      "    </tr>\n" +
      '    <tr mc:repeatable="item">\n' +
      '      <td style="padding:0 0 27px;">\n' +
      '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
      "          <tr>\n" +
      '            <td mc:edit="block_26" width="40" valign="top">\n' +
      '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
      '                   style="vertical-align:top;" alt=""/>\n' +
      "            </td>\n" +
      '            <td mc:edit="block_27" valign="top"\n' +
      '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
      "              <b>Quote ID:</b> " +
      quote_id +
      "\n" +
      "            </td>\n" +
      "          </tr>\n" +
      "        </table>\n" +
      "      </td>\n" +
      "    </tr>\n" +
      '    <tr mc:repeatable="item">\n' +
      '      <td style="padding:0 0 27px;">\n' +
      '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
      "          <tr>\n" +
      '            <td mc:edit="block_26" width="40" valign="top">\n' +
      '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
      '                   style="vertical-align:top;" alt=""/>\n' +
      "            </td>\n" +
      '            <td mc:edit="block_27" valign="top"\n' +
      '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
      "              <b>Date:</b> " +
      date_entered +
      "\n" +
      "            </td>\n" +
      "          </tr>\n" +
      "        </table>\n" +
      "      </td>\n" +
      "    </tr>\n" +
      '    <tr mc:repeatable="item">\n' +
      '      <td style="padding:0 0 27px;">\n' +
      '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
      "          <tr>\n" +
      '            <td mc:edit="block_26" width="40" valign="top">\n' +
      '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
      '                   style="vertical-align:top;" alt=""/>\n' +
      "            </td>\n" +
      '            <td mc:edit="block_27" valign="top"\n' +
      '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
      "              <b>Address:</b> " +
      (isGooglePlace ? address + ", " + city + ", " + state : address) +
      "\n" +
      "            </td>\n" +
      "          </tr>\n" +
      "        </table>\n" +
      "      </td>\n" +
      "    </tr>\n" +
      '    <tr mc:repeatable="item">\n' +
      '      <td style="padding:0 0 27px;">\n' +
      '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
      "          <tr>\n" +
      '            <td mc:edit="block_26" width="40" valign="top">\n' +
      '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
      '                   style="vertical-align:top;" alt=""/>\n' +
      "            </td>\n" +
      '            <td mc:edit="block_27" valign="top"\n' +
      '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
      "              <b>Low Price:</b> $" +
      commafy(low_price) +
      "\n" +
      "            </td>\n" +
      "          </tr>\n" +
      "        </table>\n" +
      "      </td>\n" +
      "    </tr>\n" +
      '    <tr mc:repeatable="item">\n' +
      '      <td style="padding:0 0 27px;">\n' +
      '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
      "          <tr>\n" +
      '            <td mc:edit="block_26" width="40" valign="top">\n' +
      '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
      '                   style="vertical-align:top;" alt=""/>\n' +
      "            </td>\n" +
      '            <td mc:edit="block_27" valign="top"\n' +
      '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
      "              <b>High Price:</b> $" +
      commafy(high_price) +
      "\n" +
      "            </td>\n" +
      "          </tr>\n" +
      "        </table>\n" +
      "      </td>\n" +
      "    </tr>\n" +
      '    <tr mc:repeatable="item">\n' +
      '      <td style="padding:0 0 27px;">\n' +
      '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
      "          <tr>\n" +
      '            <td mc:edit="block_26" width="40" valign="top">\n' +
      '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
      '                   style="vertical-align:top;" alt=""/>\n' +
      "            </td>\n" +
      '            <td mc:edit="block_27" valign="top"\n' +
      '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
      "              <b>Bind Now Price:</b> $" +
      commafy(bind_now_price) +
      "\n" +
      "            </td>\n" +
      "          </tr>\n" +
      "        </table>\n" +
      "      </td>\n" +
      "    </tr>\n" +
      '    <tr mc:repeatable="item">\n' +
      '      <td style="padding:0 0 27px;">\n' +
      '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
      "          <tr>\n" +
      '            <td mc:edit="block_26" width="40" valign="top">\n' +
      '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
      '                   style="vertical-align:top;" alt=""/>\n' +
      "            </td>\n" +
      '            <td mc:edit="block_27" valign="top"\n' +
      '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
      "              <b>Email:</b>" +
      email +
      "aaa\n" +
      "            </td>\n" +
      "          </tr>\n" +
      "        </table>\n" +
      "      </td>\n" +
      "    </tr>\n";

    html += emailFooter;
    const msg = {
      // to: config.agent_mail
      to: config.adminEmail,
      from: config.agentEmail,
      subject: subject,
      html: html,
    };
    sgMail.send(msg);
    resolve({ result: "success" });
  });
}

router.post("/add_car_data", function (req, res, next) {
  let { carData, uniqueId } = req.body;

  User.find(
    {
      quote_id: uniqueId,
    },
    function (err, user) {
      if (err) {
        res.render("error");
      } else {
        user[0].cars = carData;
        user[0].save();
        sendCarEmail(user[0].email, user[0].first_name, user[0].last_name, user[0].address, user[0].city, user[0].state, user[0].zip, carData, user[0].quote_id, user[0].bind_now_price)
          .then(function () {
            res.send({ result: "success" });
          })
          .catch(function () {
            res.send({ result: "error" });
          });
      }
    }
  );
  res.contentType("json");
});

/*
 * * Afer user added cars, email to admin that says user added his cars.
 * */

function sendCarEmail(email, first_name, last_name, address, city, state, zip, cars, quote_id, bind_now_price) {
  return new Promise((resolve, reject) => {
    let subject = "User - " + address + " - " + first_name + " " + last_name;
    let html = emailHeader;
    html +=
      "<tr>\n" +
      '      <td mc:edit="block_25" style="padding:0 0 29px; font-family: Verdana, Geneva,sans-serif;">\n' +
      '        <h3 style="color: #2196f3; text-align: center">User enter auto info</h3>\n' +
      "      </td>\n" +
      "    </tr>\n" +
      '    <tr mc:repeatable="item">\n' +
      '      <td style="padding:0 0 27px;">\n' +
      '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
      "          <tr>\n" +
      '            <td mc:edit="block_26" width="40" valign="top">\n' +
      '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
      '                   style="vertical-align:top;" alt=""/>\n' +
      "            </td>\n" +
      '            <td mc:edit="block_27" valign="top"\n' +
      '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
      "              <b>Quote ID:</b> " +
      quote_id +
      "\n" +
      "            </td>\n" +
      "          </tr>\n" +
      "        </table>\n" +
      "      </td>\n" +
      "    </tr>\n";

    for (let i = 0; i < cars.length; i++) {
      html +=
        '<tr mc:repeatable="item">\n' +
        '       <td style="padding:0 0 10px;">\n' +
        '         <table width="100%" cellpadding="0" cellspacing="0">\n' +
        "           <tr>\n" +
        '             <td mc:edit="block_27" valign="top"\n' +
        '               style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
        '                 <b style="margin-left:10px;">Car' +
        (i + 1) +
        ':</b> <span style="float:right;">' +
        cars[i]["year"] +
        " " +
        cars[i]["make"] +
        " " +
        cars[i]["model"] +
        "</span>\n" +
        "                   </td>\n" +
        '                     <td mc:edit="block_27" valign="top"\n' +
        '                       style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a; width: 31%;">\n' +
        "                         </td>\n" +
        "           </tr>\n" +
        "         </table>\n" +
        "       </td>\n" +
        "     </tr>\n";
    }
    html +=
      '    <tr mc:repeatable="item">\n' +
      '      <td style="padding:0 0 27px;">\n' +
      '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
      "          <tr>\n" +
      '            <td mc:edit="block_26" width="40" valign="top">\n' +
      '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
      '                   style="vertical-align:top;" alt=""/>\n' +
      "            </td>\n" +
      '            <td mc:edit="block_27" valign="top"\n' +
      '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
      "              <b>Bind Now Price:</b> $" +
      commafy(bind_now_price) +
      "\n" +
      "            </td>\n" +
      "          </tr>\n" +
      "        </table>\n" +
      "      </td>\n" +
      "    </tr>\n" +
      '    <tr mc:repeatable="item">\n' +
      '      <td style="padding:0 0 27px;">\n' +
      '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
      "          <tr>\n" +
      '            <td mc:edit="block_26" width="40" valign="top">\n' +
      '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
      '                   style="vertical-align:top;" alt=""/>\n' +
      "            </td>\n" +
      '            <td mc:edit="block_27" valign="top"\n' +
      '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
      "              <b>Email:</b>" +
      email +
      "\n" +
      "            </td>\n" +
      "          </tr>\n" +
      "        </table>\n" +
      "      </td>\n" +
      "    </tr>\n";

    html += emailFooter;
    const msg = {
      // to: config.agent_mail
      to: config.adminEmail,
      from: config.agentEmail,
      subject: subject,
      html: html,
    };
    sgMail.send(msg);
    resolve({ result: "success" });
  });
}

/*
 * if user entered their mortgage information, this action will be triggered.
 *
 *
 * */

router.post("/save_mortgage", function (req, res, next) {
  let { mortgage, mortgage_city, mortgage_state, mortgage_postal_code, mortgage_name, continue_name, lender_email, loan, mortgage_street, start_date, personData, phone_number, uniqueId } = req.body;
  const mortgage_start_date = start_date;
  let date = new Date(start_date);
  let policy_start_date = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();

  if (config.ApiInfo.iSAPITestMode) {
    let mortgage_effective_date = mortgage_start_date;
    let pre_format_expiration_date = new Date(mortgage_effective_date).getFullYear() + 1 + "-" + (new Date(mortgage_effective_date).getMonth() + 1) + "-" + new Date(mortgage_effective_date).getDate();
    let mortgage_expiration_date = dateFormat(pre_format_expiration_date, "yyyy-mm-dd");
    User.find(
      {
        quote_id: uniqueId,
      },
      function (err, user) {
        if (err) {
          res.render("error");
        } else {
          const postal_code = user[0]["zip_code"];
          const street = user[0]["address"];
          const sqft = user[0].sqft.replace(",", "");
          const source2 = {
            mortgage,
            mortgage_city,
            mortgage_state,
            mortgage_postal_code,
            mortgage_name,
            continue_name,
            lender_email,
            postal_code,
            street,
            sqft,
            loan,
            mortgage_street,
            mortgage_start_date,
            mortgage_effective_date,
            mortgage_expiration_date,
          };
          const param = Object.assign({}, user[0]._doc, source2);
          const stillwaterParams = prepare_stillwater_params(param);
          let options = {
            method: "POST",
            url: config.ApiInfo.HomeAPIURL,
            headers: {
              Host: "api-qua.stillwaterinsurance.com",
              Accept: "*/*",
              "Content-Type": "text/xml",
              Authorization: "Basic " + new Buffer.from(config.ApiInfo.accountName + ":" + config.ApiInfo.homeAPIToken).toString("base64"),
            },
            body: stillwaterParams,
          };
          request(options, function (error, response, body) {
            let data = body;
            parseString(data, function (err, result) {
              if (result != undefined) {
                if (result["ACORD"]["InsuranceSvcRs"][0]["HomePolicyQuoteInqRs"][0]["MsgStatus"][0]["MsgStatusCd"] == "Success") {
                  /*The Message Status code is success, this will be triggered.*/

                  if (mortgage) {
                    user[0].mortgage = mortgage;
                    user[0].mortgage_name = mortgage_name;
                    user[0].continue_name = continue_name;
                    user[0].mortgage_expiration_date = mortgage_expiration_date;
                    user[0].mortgage_effective_date = mortgage_effective_date;
                    user[0].mortgage_street = mortgage_street;
                    user[0].mortgage_city = mortgage_city;
                    user[0].lender_email = lender_email;
                    user[0].loan = loan;
                    user[0].mortgage_company = "Stillwater";
                  }
                  user[0].save();
                  const username = user[0]["personData"]["first_name"] + " " + user[0]["personData"]["last_name"];
                  let subject1 = "User - " + user[0]["address"] + " - " + username;
                  let html1 = emailHeader;
                  html1 +=
                    "<tr>\n" +
                    '      <td mc:edit="block_25" style="padding:0 0 29px; font-family: Verdana, Geneva,sans-serif;">\n' +
                    '        <h3 style="color: #2196f3; text-align: center">User attemped policy</h3>\n' +
                    "      </td>\n" +
                    "    </tr>\n" +
                    "<tr>\n" +
                    '     <td mc:edit="block_25" style="padding:0 0 29px; font-family: Verdana, Geneva,sans-serif;">\n' +
                    '       <h3 style="color: #3d3d3d;text-align: center">' +
                    username +
                    "</h3></td>\n" +
                    "   </tr>";

                  html1 += emailFooter;

                  const msg = {
                    // to: config.agent_mail
                    to: config.adminEmail,
                    from: config.agentEmail,
                    subject: subject1,
                    html: html1,
                  };
                  sgMail.send(msg);

                  let isGooglePlace = true;

                  if (user[0]["city"] == "" || user[0]["state"] == "" || user[0]["zip_code"] == "") {
                    isGooglePlace = false;
                  }
                  let subject2 = "User - " + user[0]["address"] + " - " + username;
                  let html2 = emailHeader;
                  html2 +=
                    "<tr>\n" +
                    '      <td mc:edit="block_25" style="padding:0 0 29px; font-family: Verdana, Geneva,sans-serif;">\n' +
                    '        <h3 style="color: #2196f3; text-align: center">User completed Policy</h3>\n' +
                    "      </td>\n" +
                    "    </tr>\n" +
                    '    <tr mc:repeatable="item">\n' +
                    '      <td style="padding:0 0 27px;">\n' +
                    '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
                    "          <tr>\n" +
                    '            <td mc:edit="block_26" width="40" valign="top">\n' +
                    '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
                    '                   style="vertical-align:top;" alt=""/>\n' +
                    "            </td>\n" +
                    '            <td mc:edit="block_27" valign="top"\n' +
                    '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                    "              <b>Quote ID:</b> " +
                    user[0]["quote_id"] +
                    "\n" +
                    "            </td>\n" +
                    "          </tr>\n" +
                    "        </table>\n" +
                    "      </td>\n" +
                    "    </tr>\n" +
                    '    <tr mc:repeatable="item">\n' +
                    '      <td style="padding:0 0 27px;">\n' +
                    '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
                    "          <tr>\n" +
                    '            <td mc:edit="block_26" width="40" valign="top">\n' +
                    '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
                    '                   style="vertical-align:top;" alt=""/>\n' +
                    "            </td>\n" +
                    '            <td mc:edit="block_27" valign="top"\n' +
                    '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                    "              <b>Policy #:</b> " +
                    user[0]["quote_id"] +
                    "\n" +
                    "            </td>\n" +
                    "          </tr>\n" +
                    "        </table>\n" +
                    "      </td>\n" +
                    "    </tr>\n" +
                    '    <tr mc:repeatable="item">\n' +
                    '      <td style="padding:0 0 27px;">\n' +
                    '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
                    "          <tr>\n" +
                    '            <td mc:edit="block_26" width="40" valign="top">\n' +
                    '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
                    '                   style="vertical-align:top;" alt=""/>\n' +
                    "            </td>\n" +
                    '            <td mc:edit="block_27" valign="top"\n' +
                    '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                    "              <b>Start Date:</b> " +
                    policy_start_date +
                    "\n" +
                    "            </td>\n" +
                    "          </tr>\n" +
                    "        </table>\n" +
                    "      </td>\n" +
                    "    </tr>\n" +
                    '    <tr mc:repeatable="item">\n' +
                    '      <td style="padding:0 0 27px;">\n' +
                    '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
                    "          <tr>\n" +
                    '            <td mc:edit="block_26" width="40" valign="top">\n' +
                    '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
                    '                   style="vertical-align:top;" alt=""/>\n' +
                    "            </td>\n" +
                    '            <td mc:edit="block_27" valign="top"\n' +
                    '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                    "              <b>Effective Date:</b> " +
                    mortgage_effective_date +
                    "\n" +
                    "            </td>\n" +
                    "          </tr>\n" +
                    "        </table>\n" +
                    "      </td>\n" +
                    "    </tr>\n" +
                    '    <tr mc:repeatable="item">\n' +
                    '      <td style="padding:0 0 27px;">\n' +
                    '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
                    "          <tr>\n" +
                    '            <td mc:edit="block_26" width="40" valign="top">\n' +
                    '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
                    '                   style="vertical-align:top;" alt=""/>\n' +
                    "            </td>\n" +
                    '            <td mc:edit="block_27" valign="top"\n' +
                    '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                    "              <b>Address:</b> " +
                    (isGooglePlace ? user[0]["address"] + ", " + user[0]["city"] + ", " + user[0]["state"] : user[0]["address"]) +
                    "\n" +
                    "            </td>\n" +
                    "          </tr>\n" +
                    "        </table>\n" +
                    "      </td>\n" +
                    "    </tr>\n" +
                    '    <tr mc:repeatable="item">\n' +
                    '      <td style="padding:0 0 27px;">\n' +
                    '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
                    "          <tr>\n" +
                    '            <td mc:edit="block_26" width="40" valign="top">\n' +
                    '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
                    '                   style="vertical-align:top;" alt=""/>\n' +
                    "            </td>\n" +
                    '            <td mc:edit="block_27" valign="top"\n' +
                    '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                    "              <b>Bind Now Price:</b> $" +
                    commafy(user[0]["amount"]) +
                    "\n" +
                    "            </td>\n" +
                    "          </tr>\n" +
                    "        </table>\n" +
                    "      </td>\n" +
                    "    </tr>\n" +
                    '    <tr mc:repeatable="item">\n' +
                    '      <td style="padding:0 0 27px;">\n' +
                    '        <table width="100%" cellpadding="0" cellspacing="0">\n' +
                    "          <tr>\n" +
                    '            <td mc:edit="block_26" width="40" valign="top">\n' +
                    '              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
                    '                   style="vertical-align:top;" alt=""/>\n' +
                    "            </td>\n" +
                    '            <td mc:edit="block_27" valign="top"\n' +
                    '                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                    "              <b>Email:</b>" +
                    user[0]["email"] +
                    "\n" +
                    "            </td>\n" +
                    "          </tr>\n" +
                    "        </table>\n" +
                    "      </td>\n" +
                    "    </tr>\n";

                  html2 += emailFooter;

                  const msg2 = {
                    // to: config.agent_mail
                    to: config.adminEmail,
                    from: config.agentEmail,
                    subject: subject2,
                    html: html2,
                  };
                  sgMail.send(msg2);
                  let subject3 = "Policy Complete - Your Documents Are Here";
                  let html3 = emailHeader;

                  html3 +=
                    "<tr>\n" +
                    '     <td mc:edit="block_25" style="padding:0 0 29px; font-family: Verdana, Geneva,sans-serif;">\n' +
                    '       <h3 style="color: #3d3d3d;text-align: center">Your policy setup is complete! See below for important information about your new policy. </h3></td>\n' +
                    "   </tr>";

                  generateInvoicePDF(user[0]["quote_id"], user[0]["personData"][0]["first_name"], user[0]["personData"][0]["last_name"], user[0]["amount"], policy_start_date)
                    .then((resposeData) => {
                      if (resposeData["result"] != "success") {
                        res.send({ result: "error" });
                        return;
                      } else {
                        let domain = req.headers.origin;
                        User.find(
                          {
                            quote_id: uniqueId,
                          },
                          function (err, user) {
                            if (err) {
                              res.render("error");
                            } else {
                              //console.log(resposeData["filename"], "resposeData['filename']");
                              user[0].policy_document_url = resposeData["filename"];
                              user[0].save();

                              let invoicePDFURL = domain + "/pdfs/" + user[0]["personData"][0]["first_name"] + "-INVOICE" + user[0]["quote_id"] + ".pdf";
                              let evidencePDFURL = resposeData["filename"];

                              html3 +=
                                '<tr mc:repeatable="item">\n' +
                                '       <td style="padding:0 0 10px;">\n' +
                                '         <table width="100%" cellpadding="0" cellspacing="0">\n' +
                                "           <tr>\n" +
                                '             <td mc:edit="block_27" valign="top"\n' +
                                '               style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                                '                 <b style="margin-left:10px;">Policy #:</b> <span style="float:right;">' +
                                user[0]["quote_id"] +
                                "</span>\n" +
                                "                   </td>\n" +
                                '                     <td mc:edit="block_27" valign="top"\n' +
                                '                       style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a; width: 31%;">\n' +
                                "                         </td>\n" +
                                "           </tr>\n" +
                                "         </table>\n" +
                                "       </td>\n" +
                                "     </tr>\n";
                              html3 +=
                                '<tr mc:repeatable="item">\n' +
                                '       <td style="padding:0 0 10px;">\n' +
                                '         <table width="100%" cellpadding="0" cellspacing="0">\n' +
                                "           <tr>\n" +
                                '             <td mc:edit="block_27" valign="top"\n' +
                                '               style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                                '                 <b style="margin-left:10px;">Company:</b> <span style="float:right;">Stillwater</span>\n' +
                                "                   </td>\n" +
                                '                     <td mc:edit="block_27" valign="top"\n' +
                                '                       style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a; width: 31%;">\n' +
                                "                         </td>\n" +
                                "           </tr>\n" +
                                "         </table>\n" +
                                "       </td>\n" +
                                "     </tr>\n" +
                                '<tr mc:repeatable="item">\n' +
                                '       <td style="padding:0 0 10px;">\n' +
                                '         <table width="100%" cellpadding="0" cellspacing="0">\n' +
                                "           <tr>\n" +
                                '             <td mc:edit="block_27" valign="top"\n' +
                                '               style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                                '                 <b style="margin-left:10px;">Address:</b> <span style="float:right;">' +
                                user[0]["address"] +
                                (user[0]["city"] != "" ? ", " + user[0]["city"] : "") +
                                (user[0]["state"] != "" ? ", " + user[0]["state"] : "") +
                                (user[0]["zip_code"] != "" ? " " + user[0]["zip_code"] : "") +
                                "</span>\n" +
                                "                   </td>\n" +
                                "           </tr>\n" +
                                "         </table>\n" +
                                "       </td>\n" +
                                "     </tr>\n";

                              html3 +=
                                '<tr mc:repeatable="item">\n' +
                                '       <td style="padding:0 0 10px;">\n' +
                                '         <table width="100%" cellpadding="0" cellspacing="0">\n' +
                                "           <tr>\n" +
                                '             <td mc:edit="block_27" valign="top"\n' +
                                '               style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                                '                 <b style="margin-left:10px;">Documents</b></span>\n' +
                                "                   </td>\n" +
                                "           </tr>\n" +
                                "         </table>\n" +
                                "       </td>\n" +
                                "     </tr>\n";

                              html3 +=
                                '<tr mc:repeatable="item">\n' +
                                '       <td style="padding:0 0 10px;">\n' +
                                '         <table width="100%" cellpadding="0" cellspacing="0">\n' +
                                "           <tr>\n" +
                                '             <td mc:edit="block_27" valign="top"\n' +
                                '               style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a; text-align:center;">\n' +
                                '                 <b style="margin-left:10px;"><i>You can send these documents to your mortgage company</i></b></span>\n' +
                                "                   </td>\n" +
                                "           </tr>\n" +
                                "         </table>\n" +
                                "       </td>\n" +
                                "     </tr>\n";
                              html3 +=
                                '<tr mc:repeatable="item">\n' +
                                '       <td style="padding:0 0 10px;">\n' +
                                '         <table width="100%" cellpadding="0" cellspacing="0">\n' +
                                "           <tr>\n" +
                                '             <td mc:edit="block_27" valign="top"\n' +
                                '               style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                                '                 <b style="margin-left:10px;">Invoice:</b><a href=\'' +
                                invoicePDFURL +
                                '\'><span style="float:right;">Get Invoice</a></span>\n' +
                                "                   </td>\n" +
                                "           </tr>\n" +
                                "         </table>\n" +
                                "       </td>\n" +
                                "     </tr>\n";

                              html3 +=
                                '<tr mc:repeatable="item">\n' +
                                '       <td style="padding:0 0 10px;">\n' +
                                '         <table width="100%" cellpadding="0" cellspacing="0">\n' +
                                "           <tr>\n" +
                                '             <td mc:edit="block_27" valign="top"\n' +
                                '               style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
                                '                 <b style="margin-left:10px;">Evidence of insurance:</b><a href=\'' +
                                evidencePDFURL +
                                '\'><span style="float:right;">' +
                                user[0]["quote_id"] +
                                "</a></span>\n" +
                                "                   </td>\n" +
                                "           </tr>\n" +
                                "         </table>\n" +
                                "       </td>\n" +
                                "     </tr>\n" +
                                "\n" +
                                '                    <tr mc:repeatable="item">\n' +
                                '                      <td style="padding:0 0 27px;">\n' +
                                '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
                                "                          <tr>\n" +
                                '                            <td mc:edit="block_27" valign="top"\n' +
                                '                                style="font:18px/24px Verdana, Geneva, sans-serif; color:#3b434a; text-align: center;">\n' +
                                "                              <b>Did You Bundle Your Auto?</b>\n" +
                                "                            </td>\n" +
                                "                          </tr>\n" +
                                "                        </table>\n" +
                                "                      </td>\n" +
                                "                    </tr>\n" +
                                "\n" +
                                '                    <tr mc:repeatable="item">\n' +
                                '                      <td style="padding:0 0 27px;">\n' +
                                '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
                                "                          <tr>\n" +
                                '                            <td mc:edit="block_26" width="40" valign="top" style="font: 14px/24px Verdana, Geneva, sans-serif;\n' +
                                "                              color: #3b434a;\n" +
                                "                              text-align: center;\n" +
                                "                              padding-left: 20px;\n" +
                                '                              padding-right: 20px;">\n' +
                                "                              <strong><i>Bundling your home and auto together will help you save money and keep things simple for\n" +
                                "                                you. Click below to provide your auto information to get a bundled quote!</i></strong>\n" +
                                "                            </td>\n" +
                                "                          </tr>\n" +
                                "                        </table>\n" +
                                "                      </td>\n" +
                                "                    </tr>\n";
                              html3 += emailFooter;
                              const msg3 = {
                                // to: config.agent_mail
                                to: user[0]["email"],
                                from: config.agentEmail,
                                subject: subject3,
                                html: html3,
                              };
                              if (lender_email != "" && lender_email != undefined && lender_email !== user[0]["email"]) {
                                msg3["cc"] = lender_email;
                              }
                              sgMail.send(msg3);
                              res.send({
                                result: "success",
                                data: user[0],
                                invoicePDFURL: invoicePDFURL,
                                evidencePDFURL: evidencePDFURL,
                              });
                            }
                          }
                        );
                      }
                    })
                    .catch(function () {
                      res.send({ result: "error" });
                    });
                } else {
                  res.send({ result: "error" });
                }
              } else {
                res.send({ result: "error" });
              }
            });
            if (error) {
              res.send({ result: "error" });
            }
          });
        }
      }
    );
  }
});

function generateInvoicePDF(policy_number, first_name, last_name, price, start_date) {
  // console.log(policy_number, "policy_number");
  // console.log(first_name, "first_name");
  // console.log(last_name, "last_name");
  // console.log(price, "price");
  // console.log(start_date, "start_date");
  return new Promise((resolve, reject) => {
    let now = new Date();
    let clientDt = dateFormat(now, "yyyy-mm-dd");
    start_date = dateFormat(start_date, "yyyy-mm-dd");
    let commondata = commonTemplate.getCommonStillwaterParam(clientDt);
    let content =
      "<InsuranceSvcRq>\n" +
      "      <RqUID>00000000-0000-0000-0000-000000000000</RqUID>\n" +
      "      <PolicyInqRq>\n" +
      "         <RqUID>00000000-0000-0000-0000-000000000000</RqUID>\n" +
      "         <TransactionRequestDt>" +
      start_date +
      "</TransactionRequestDt>\n" +
      "         <CurCd>USD</CurCd>\n" +
      "         <AsOfDt>" +
      start_date +
      "</AsOfDt>\n" +
      "         <Requestor>\n" +
      "            <ContractNumber>99999</ContractNumber>\n" +
      "         </Requestor>\n" +
      "         <PolicyInqInfo>\n" +
      "            <PartialPolicy>\n" +
      "               <PolicyNumber>" +
      policy_number +
      "</PolicyNumber>\n" +
      "               <LOBCd>HOME</LOBCd>\n" +
      "            </PartialPolicy>\n" +
      "         </PolicyInqInfo>\n" +
      "      </PolicyInqRq>\n" +
      "   </InsuranceSvcRq>\n" +
      "</ACORD>";
    let param = commondata + content;
    let options = {
      method: "POST",
      url: config.ApiInfo.DocAPIURL,
      headers: {
        Host: "api-qua.stillwaterinsurance.com",
        Accept: "*/*",
        "Content-Type": "text/xml",
        Authorization: "Basic " + new Buffer.from(config.ApiInfo.accountName + ":" + config.ApiInfo.homeAPIToken).toString("base64"),
      },
      body: param,
    };
    request(options, function (error, response, body) {
      let data = body;
      parseString(data, function (err, result) {
        if (result["ACORD"]["InsuranceSvcRs"][0]["PolicyInqRs"][0]["MsgStatus"][0]["MsgStatusCd"] == "SUCCESS") {
          let path = "./pdfs/";
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
          }
          var doc = new PDFDocument({ size: [800, 1100] });
          // Stripping special characters
          var filename = first_name + "-INVOICE" + policy_number;

          // If you use 'inline' here it will automatically open the PDF
          doc.image("./src/assets/images/logo.png", 100, 50, { width: 200 });
          // Setting response to 'attachment' (download).

          doc.font("./src/assets/fonts/Roboto/Roboto-Bold.ttf").fontSize(50).text("I N V O I C E", 400, 125);
          doc.font("./src/assets/fonts/Roboto/Roboto-Bold.ttf").fontSize(50).underline(400, 175, 300, 3, { color: "#000" });
          doc
            .font("./src/assets/fonts/Roboto/Roboto-Bold.ttf")
            .fontSize(20)
            .fillColor("black")
            .text("Name:                ", 125, 400, {
              width: 465,
              continued: true,
            })
            .font("./src/assets/fonts/Roboto/Roboto-Bold.ttf")
            .fontSize(20)
            .fillColor("#25A9E1")
            .text(first_name + " " + last_name);

          doc.font("./src/assets/fonts/Roboto/Roboto-Bold.ttf").fontSize(50).underline(100, 420, 500, 3, { color: "#000" });
          doc
            .font("./src/assets/fonts/Roboto/Roboto-Bold.ttf")
            .fontSize(20)
            .fillColor("black")
            .text("Policy #:             ", 125, 440, {
              width: 465,
              continued: true,
            })
            .font("./src/assets/fonts/Roboto/Roboto-Bold.ttf")
            .fontSize(20)
            .fillColor("#25A9E1")
            .text(policy_number);

          doc.font("./src/assets/fonts/Roboto/Roboto-Bold.ttf").fontSize(50).underline(100, 460, 500, 3, { color: "#000" });
          doc
            .font("./src/assets/fonts/Roboto/Roboto-Bold.ttf")
            .fontSize(20)
            .fillColor("black")
            .text("Amount Due:     ", 125, 480, {
              width: 465,
              continued: true,
            })
            .font("./src/assets/fonts/Roboto/Roboto-Bold.ttf")
            .fontSize(20)
            .fillColor("#25A9E1")
            .text("$" + commafy(price));

          doc.font("./src/assets/fonts/Roboto/Roboto-Bold.ttf").fontSize(50).underline(100, 500, 500, 3, { color: "#000" });
          doc.font("./src/assets/fonts/Roboto/Roboto-Bold.ttf").fontSize(23).fillColor("#000").text("**Please make payments to:", 210, 650);
          doc
            .rotate(0, { origin: [150, 70] })
            .rect(160, 680, 410, 180)
            .fill("#ECEDEF");
          doc.font("./src/assets/fonts/Roboto/Roboto-Bold.ttf").fontSize(23).fillColor("#000").text("Stillwater Insurance", 220, 720);
          doc.font("./src/assets/fonts/Roboto/Roboto-Bold.ttf").fontSize(23).fillColor("#000").text("PO Box 55877", 220, 755);
          doc.font("./src/assets/fonts/Roboto/Roboto-Bold.ttf").fontSize(23).fillColor("#000").text("Boston, MA 02205-5877", 220, 790);
          doc.font("./src/assets/fonts/Roboto/Roboto-Bold.ttf").fontSize(18).fillColor("#EF3F36").text("Customer Service", 285, 880);
          doc.font("./src/assets/fonts/Roboto/Roboto-Bold.ttf").fontSize(16).fillColor("#33b5e5").text("1-800-903-3232", 300, 910);
          doc.font("./src/assets/fonts/Roboto/Roboto-Bold.ttf").fontSize(18).fillColor("#EF3F36").text("Customer Service", 285, 960);
          doc.font("./src/assets/fonts/Roboto/Roboto-Bold.ttf").fontSize(16).fillColor("#33b5e5").text("service@boom.insure", 260, 990, {
            link: "mailto:service@boom.insure",
            underline: false,
          });

          let listener = doc.pipe(fs.createWriteStream(path + filename + ".pdf"));

          doc.end();
          listener.on("finish", function () {
            resolve({
              result: "success",
              filename: result["ACORD"]["InsuranceSvcRs"][0]["PolicyInqRs"][0]["PolInfo"][0]["HomePolicy"][0]["PolicySummaryInfo"][0]["com.stillwater_PolicyDocument"][0]["com.stillwater_DocumentUrl"][0],
            });
          });
          listener.on("error", function () {
            reject({ result: "error" });
          });
        } else {
          reject({ result: "error" });
        }
      });
      if (error) {
        reject({ result: "error" });
      }
    });
  });
}

router.post("/check_valid", function (req, res, next) {
  let { uniqueId } = req.body;
  User.find(
    {
      quote_id: uniqueId,
    },
    function (err, user) {
      if (err) {
        res.send({ result: "error" });
      } else {
        res.send({ result: "success", data: user });
      }
    }
  );
});

/*
 * Return the user data
 * */
function commafy(num) {
  if (num == "" || num == undefined) {
    return "";
  }
  const str = num.toString().split(".");
  if (str[0].length >= 4) {
    str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, "$1,");
  }
  if (str[1] && str[1].length >= 5) {
    str[1] = str[1].replace(/(\d{3})/g, "$1 ");
  }
  return str.join(".");
}

router.post("/get_quote_data", function (req, res, next) {
  let { uniqueId } = req.body;
  User.find(
    {
      quote_id: uniqueId,
    },
    function (err, user) {
      if (err) {
        res.send({ result: "The quote ID doesn'/t match" });
      } else {
        res.send({ result: "success", data: user });
      }
    }
  );
});

router.post("/bundle_auto", function (req, res, next) {
  let { uniqueId } = req.body;
  User.find(
    {
      quote_id: uniqueId,
    },
    function (err, user) {
      if (err) {
        res.send({ result: "The quote ID doesn'/t match" });
      } else {
        let data = user[0];
        let subject = "Quote Details";
        let html = emailHeader;
        html +=
          '<td class="plr-15 pb-15">\n' +
          '                  <table width="100%" cellpadding="0" cellspacing="0">\n' +
          "                    <tr>\n" +
          '                      <td mc:edit="block_25" style="padding:0 0 29px; font-family: Verdana, Geneva,sans-serif;">\n' +
          '                        <h3 style="color: #2196f3; text-align: center">Thank You!</h3>\n' +
          "                      </td>\n" +
          "                    </tr>\n" +
          '                    <tr mc:repeatable="item">\n' +
          '                      <td style="padding:0 0 27px;">\n' +
          '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
          "                          <tr>\n" +
          '                            <td mc:edit="block_26" width="40" valign="top">\n' +
          '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
          '                                   style="vertical-align:top;" alt=""/>\n' +
          "                            </td>\n" +
          '                            <td mc:edit="block_27" valign="top"\n' +
          '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
          "                              <b>Name:</b> " +
          (data["first_name"] + " " + data["last_name"]) +
          "\n" +
          "                            </td>\n" +
          "                          </tr>\n" +
          "                        </table>\n" +
          "                      </td>\n" +
          "                    </tr>\n" +
          '                    <tr mc:repeatable="item">\n' +
          '                      <td style="padding:0 0 27px;">\n' +
          '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
          "                          <tr>\n" +
          '                            <td mc:edit="block_26" width="40" valign="top">\n' +
          '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
          '                                   style="vertical-align:top;" alt=""/>\n' +
          "                            </td>\n" +
          '                            <td mc:edit="block_27" valign="top"\n' +
          '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
          "                              <b>Email:</b> " +
          data["email"] +
          "\n" +
          "                            </td>\n" +
          "                          </tr>\n" +
          "                        </table>\n" +
          "                      </td>\n" +
          "                    </tr>\n" +
          '                    <tr mc:repeatable="item">\n' +
          '                      <td style="padding:0 0 27px;">\n' +
          '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
          "                          <tr>\n" +
          '                            <td mc:edit="block_26" width="40" valign="top">\n' +
          '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
          '                                   style="vertical-align:top;" alt=""/>\n' +
          "                            </td>\n" +
          '                            <td mc:edit="block_27" valign="top"\n' +
          '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
          "                              <b>Address:</b> " +
          data["address"] +
          (data["city"] != "" ? ", " + data["city"] : "") +
          (data["state"] != "" ? ", " + data["state"] : "") +
          (data["zip"] != "" ? " " + data["zip"] : "") +
          "\n" +
          "                            </td>\n" +
          "                          </tr>\n" +
          "                        </table>\n" +
          "                      </td>\n" +
          "                    </tr>\n" +
          '                    <tr mc:repeatable="item">\n' +
          '                      <td style="padding:0 0 27px;">\n' +
          '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
          "                          <tr>\n" +
          '                            <td mc:edit="block_26" width="40" valign="top">\n' +
          '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
          '                                   style="vertical-align:top;" alt=""/>\n' +
          "                            </td>\n" +
          '                            <td mc:edit="block_27" valign="top"\n' +
          '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
          "                              <b>Quot ID:</b> " +
          data["quote_id"] +
          "\n" +
          "                            </td>\n" +
          "                          </tr>\n" +
          "                        </table>\n" +
          "                      </td>\n" +
          "                    </tr>\n" +
          '                    <tr mc:repeatable="item">\n' +
          '                      <td style="padding:0 0 27px;">\n' +
          '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
          "                          <tr>\n" +
          '                            <td mc:edit="block_26" width="40" valign="top">\n' +
          '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
          '                                   style="vertical-align:top;" alt=""/>\n' +
          "                            </td>\n" +
          '                            <td mc:edit="block_27" valign="top"\n' +
          '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
          "                              <b>Policy Start Date:</b> " +
          data["policy_start_date"] +
          "\n" +
          "                            </td>\n" +
          "                          </tr>\n" +
          "                        </table>\n" +
          "                      </td>\n" +
          "                    </tr>\n" +
          '                    <tr mc:repeatable="item">\n' +
          '                      <td style="padding:0 0 27px;">\n' +
          '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
          "                          <tr>\n" +
          '                            <td mc:edit="block_26" width="40" valign="top">\n' +
          '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
          '                                   style="vertical-align:top;" alt=""/>\n' +
          "                            </td>\n" +
          '                            <td mc:edit="block_27" valign="top"\n' +
          '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
          "                              <b>Policy Number:</b> " +
          data["policy_number"] +
          "\n" +
          "                            </td>\n" +
          "                          </tr>\n" +
          "                        </table>\n" +
          "                      </td>\n" +
          "                    </tr>\n" +
          '                    <tr mc:repeatable="item">\n' +
          '                      <td style="padding:0 0 27px;">\n' +
          '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
          "                          <tr>\n" +
          '                            <td mc:edit="block_26" width="40" valign="top">\n' +
          '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
          '                                   style="vertical-align:top;" alt=""/>\n' +
          "                            </td>\n" +
          '                            <td mc:edit="block_27" valign="top"\n' +
          '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
          "                              <b>Bind now price Number:</b> $" +
          commafy(data["bind_now_price"]) +
          "\n" +
          "                            </td>\n" +
          "                          </tr>\n" +
          "                        </table>\n" +
          "                      </td>\n" +
          "                    </tr>\n" +
          '                    <tr mc:repeatable="item">\n' +
          '                      <td style="padding:0 0 27px;">\n' +
          '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
          "                          <tr>\n" +
          '                            <td mc:edit="block_26" width="40" valign="top">\n' +
          '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
          '                                   style="vertical-align:top;" alt=""/>\n' +
          "                            </td>\n" +
          '                            <td mc:edit="block_27" valign="top"\n' +
          '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
          "                              <b>Low price:</b> $" +
          commafy(data["low_price"]) +
          "\n" +
          "                            </td>\n" +
          "                          </tr>\n" +
          "                        </table>\n" +
          "                      </td>\n" +
          "                    </tr>\n" +
          '                    <tr mc:repeatable="item">\n' +
          '                      <td style="padding:0 0 27px;">\n' +
          '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
          "                          <tr>\n" +
          '                            <td mc:edit="block_26" width="40" valign="top">\n' +
          '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
          '                                   style="vertical-align:top;" alt=""/>\n' +
          "                            </td>\n" +
          '                            <td mc:edit="block_27" valign="top"\n' +
          '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
          "                              <b>Policy Number:</b> $" +
          commafy(data["high_price"]) +
          "\n" +
          "                            </td>\n" +
          "                          </tr>\n" +
          "                        </table>\n" +
          "                      </td>\n" +
          "                    </tr>\n" +
          '                    <tr mc:repeatable="item">\n' +
          '                      <td style="padding:0 0 27px;">\n' +
          '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
          "                          <tr>\n" +
          '                            <td mc:edit="block_26" width="40" valign="top">\n' +
          '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
          '                                   style="vertical-align:top;" alt=""/>\n' +
          "                            </td>\n" +
          '                            <td mc:edit="block_27" valign="top"\n' +
          '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
          "                              <b>Bind now:</b> " +
          data["bind_now"] +
          "\n" +
          "                            </td>\n" +
          "                          </tr>\n" +
          "                        </table>\n" +
          "                      </td>\n" +
          "                    </tr>\n";
        if (data["hand_off"]) {
          html +=
            '                    <tr mc:repeatable="item">\n' +
            '                      <td style="padding:0 0 27px;">\n' +
            '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
            "                          <tr>\n" +
            '                            <td mc:edit="block_26" width="40" valign="top">\n' +
            '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
            '                                   style="vertical-align:top;" alt=""/>\n' +
            "                            </td>\n" +
            '                            <td mc:edit="block_27" valign="top"\n' +
            '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
            "                              <b>Hand Off From:</b> " +
            data["hand_off_from"] +
            "\n" +
            "                            </td>\n" +
            "                          </tr>\n" +
            "                        </table>\n" +
            "                      </td>\n" +
            "                    </tr>\n" +
            '                    <tr mc:repeatable="item">\n' +
            '                      <td style="padding:0 0 27px;">\n' +
            '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
            "                          <tr>\n" +
            '                            <td mc:edit="block_26" width="40" valign="top">\n' +
            '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
            '                                   style="vertical-align:top;" alt=""/>\n' +
            "                            </td>\n" +
            '                            <td mc:edit="block_27" valign="top"\n' +
            '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
            "                              <b>Hand Off From Email:</b> " +
            data["hand_off_from_email"] +
            "\n" +
            "                            </td>\n" +
            "                          </tr>\n" +
            "                        </table>\n" +
            "                      </td>\n" +
            "                    </tr>\n" +
            '                    <tr mc:repeatable="item">\n' +
            '                      <td style="padding:0 0 27px;">\n' +
            '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
            "                          <tr>\n" +
            '                            <td mc:edit="block_26" width="40" valign="top">\n' +
            '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
            '                                   style="vertical-align:top;" alt=""/>\n' +
            "                            </td>\n" +
            '                            <td mc:edit="block_27" valign="top"\n' +
            '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
            "                              <b>Hand Off To:</b> " +
            data["hand_off_to"] +
            "\n" +
            "                            </td>\n" +
            "                          </tr>\n" +
            "                        </table>\n" +
            "                      </td>\n" +
            "                    </tr>\n";
        }
        if (data["discounts"]) {
          html +=
            '                    <tr mc:repeatable="item">\n' +
            '                      <td style="padding:0 0 27px;">\n' +
            '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
            "                          <tr>\n" +
            '                            <td mc:edit="block_26" width="40" valign="top">\n' +
            '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
            '                                   style="vertical-align:top;" alt=""/>\n' +
            "                            </td>\n" +
            '                            <td mc:edit="block_27" valign="top"\n' +
            '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
            "                              <b>Alarm:</b> " +
            data["alarm"] +
            "\n" +
            "                            </td>\n" +
            "                          </tr>\n" +
            "                        </table>\n" +
            "                      </td>\n" +
            "                    </tr>\n" +
            '                    <tr mc:repeatable="item">\n' +
            '                      <td style="padding:0 0 27px;">\n' +
            '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
            "                          <tr>\n" +
            '                            <td mc:edit="block_26" width="40" valign="top">\n' +
            '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
            '                                   style="vertical-align:top;" alt=""/>\n' +
            "                            </td>\n" +
            '                            <td mc:edit="block_27" valign="top"\n' +
            '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
            "                              <b>Bundle:</b> " +
            data["bundle"] +
            "\n" +
            "                            </td>\n" +
            "                          </tr>\n" +
            "                        </table>\n" +
            "                      </td>\n" +
            "                    </tr>\n" +
            '                    <tr mc:repeatable="item">\n' +
            '                      <td style="padding:0 0 27px;">\n' +
            '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
            "                          <tr>\n" +
            '                            <td mc:edit="block_26" width="40" valign="top">\n' +
            '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
            '                                   style="vertical-align:top;" alt=""/>\n' +
            "                            </td>\n" +
            '                            <td mc:edit="block_27" valign="top"\n' +
            '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
            "                              <b>Delivery:</b> " +
            data["delivery"] +
            "\n" +
            "                            </td>\n" +
            "                          </tr>\n" +
            "                        </table>\n" +
            "                      </td>\n" +
            "                    </tr>\n";
        }

        if (data["mortgage"]) {
          html +=
            '                    <tr mc:repeatable="item">\n' +
            '                      <td style="padding:0 0 27px;">\n' +
            '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
            "                          <tr>\n" +
            '                            <td mc:edit="block_26" width="40" valign="top">\n' +
            '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
            '                                   style="vertical-align:top;" alt=""/>\n' +
            "                            </td>\n" +
            '                            <td mc:edit="block_27" valign="top"\n' +
            '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
            "                              <b>Mortgage Address:</b> " +
            data["mortgage_address"] +
            "\n" +
            "                            </td>\n" +
            "                          </tr>\n" +
            "                        </table>\n" +
            "                      </td>\n" +
            "                    </tr>\n" +
            '                    <tr mc:repeatable="item">\n' +
            '                      <td style="padding:0 0 27px;">\n' +
            '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
            "                          <tr>\n" +
            '                            <td mc:edit="block_26" width="40" valign="top">\n' +
            '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
            '                                   style="vertical-align:top;" alt=""/>\n' +
            "                            </td>\n" +
            '                            <td mc:edit="block_27" valign="top"\n' +
            '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
            "                              <b>Mortgage City:</b> " +
            data["mortgage_city"] +
            "\n" +
            "                            </td>\n" +
            "                          </tr>\n" +
            "                        </table>\n" +
            "                      </td>\n" +
            "                    </tr>\n" +
            '                    <tr mc:repeatable="item">\n' +
            '                      <td style="padding:0 0 27px;">\n' +
            '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
            "                          <tr>\n" +
            '                            <td mc:edit="block_26" width="40" valign="top">\n' +
            '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
            '                                   style="vertical-align:top;" alt=""/>\n' +
            "                            </td>\n" +
            '                            <td mc:edit="block_27" valign="top"\n' +
            '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
            "                              <b>Mortgage Company:</b> " +
            data["mortgage_company"] +
            "\n" +
            "                            </td>\n" +
            "                          </tr>\n" +
            "                        </table>\n" +
            "                      </td>\n" +
            "                    </tr>\n" +
            '                    <tr mc:repeatable="item">\n' +
            '                      <td style="padding:0 0 27px;">\n' +
            '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
            "                          <tr>\n" +
            '                            <td mc:edit="block_26" width="40" valign="top">\n' +
            '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
            '                                   style="vertical-align:top;" alt=""/>\n' +
            "                            </td>\n" +
            '                            <td mc:edit="block_27" valign="top"\n' +
            '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
            "                              <b>Mortgage Name:</b> " +
            data["mortgage_name"] +
            "\n" +
            "                            </td>\n" +
            "                          </tr>\n" +
            "                        </table>\n" +
            "                      </td>\n" +
            "                    </tr>\n" +
            '                    <tr mc:repeatable="item">\n' +
            '                      <td style="padding:0 0 27px;">\n' +
            '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
            "                          <tr>\n" +
            '                            <td mc:edit="block_26" width="40" valign="top">\n' +
            '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
            '                                   style="vertical-align:top;" alt=""/>\n' +
            "                            </td>\n" +
            '                            <td mc:edit="block_27" valign="top"\n' +
            '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
            "                              <b>Mortgage Name2:</b> " +
            data["mortgage_name_2"] +
            "\n" +
            "                            </td>\n" +
            "                          </tr>\n" +
            "                        </table>\n" +
            "                      </td>\n" +
            "                    </tr>\n" +
            '                    <tr mc:repeatable="item">\n' +
            '                      <td style="padding:0 0 27px;">\n' +
            '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
            "                          <tr>\n" +
            '                            <td mc:edit="block_26" width="40" valign="top">\n' +
            '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
            '                                   style="vertical-align:top;" alt=""/>\n' +
            "                            </td>\n" +
            '                            <td mc:edit="block_27" valign="top"\n' +
            '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
            "                              <b>Loan#:</b> " +
            data["loan"] +
            "\n" +
            "                            </td>\n" +
            "                          </tr>\n" +
            "                        </table>\n" +
            "                      </td>\n" +
            "                    </tr>\n" +
            '                    <tr mc:repeatable="item">\n' +
            '                      <td style="padding:0 0 27px;">\n' +
            '                        <table width="100%" cellpadding="0" cellspacing="0">\n' +
            "                          <tr>\n" +
            '                            <td mc:edit="block_26" width="40" valign="top">\n' +
            '                              <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
            '                                   style="vertical-align:top;" alt=""/>\n' +
            "                            </td>\n" +
            '                            <td mc:edit="block_27" valign="top"\n' +
            '                                style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
            "                              <b>Lender Email:</b> " +
            data["lender_email"] +
            "\n" +
            "                            </td>\n" +
            "                          </tr>\n" +
            "                        </table>\n" +
            "                      </td>\n" +
            "                    </tr>\n";
        }
        if (data["cars"].length > 0) {
          for (let i = 0; i < data["cars"].length; i++) {
            let model = data["cars"][i]["model"] == undefined ? "" : data["cars"][i]["model"];
            let make = data["cars"][i]["make"] == undefined ? "" : data["cars"][i]["make"];
            let year = data["cars"][i]["year"] == undefined ? "" : data["cars"][i]["year"];
            html +=
              '<tr mc:repeatable="item">\n' +
              '  <td style="padding:0 0 27px;">\n' +
              '    <table width="100%" cellpadding="0" cellspacing="0">\n' +
              "      <tr>\n" +
              '        <td mc:edit="block_26" width="40" valign="top">\n' +
              '          <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
              '               style="vertical-align:top;" alt=""/>\n' +
              "        </td>\n" +
              '        <td mc:edit="block_27" valign="top"\n' +
              '            style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
              "          <b>Car" +
              (i + 1) +
              ":</b> " +
              model +
              "     " +
              make +
              "     " +
              year +
              "\n" +
              "        </td>\n" +
              "      </tr>\n" +
              "    </table>\n" +
              "  </td>\n" +
              "</tr>\n";
          }
        }

        if (data["users"].length > 0) {
          for (let i = 0; i < data["users"].length; i++) {
            let first_name = data["users"][i]["first_name"] == undefined ? "" : data["users"][i]["first_name"];
            let last_name = data["users"][i]["last_name"] == undefined ? "" : data["users"][i]["last_name"];
            let birthday = data["users"][i]["birthday"] == undefined ? "" : data["users"][i]["birthday"];
            html +=
              '<tr mc:repeatable="item">\n' +
              ' <td style="padding:0 0 27px;">\n' +
              '   <table width="100%" cellpadding="0" cellspacing="0">\n' +
              "     <tr>\n" +
              '       <td mc:edit="block_26" width="40" valign="top">\n' +
              '         <img src="https://www.psd2html.com/examples/markup/ultimaker/ico-01.png" width="32"\n' +
              '              style="vertical-align:top;" alt=""/>\n' +
              "       </td>\n" +
              '       <td mc:edit="block_27" valign="top"\n' +
              '           style="font:14px/24px Verdana, Geneva, sans-serif; color:#3b434a;">\n' +
              "         <b>User" +
              (i + 1) +
              ":</b> " +
              first_name +
              " " +
              last_name +
              "     " +
              birthday +
              "\n" +
              "       </td>\n" +
              "     </tr>\n" +
              "   </table>\n" +
              " </td>\n" +
              "</tr>\n";
          }
        }

        html += "</table>\n" + "</td>";
        html += emailFooter;
        const msg = {
          // to: config.agent_mail
          to: config.adminEmail,
          from: config.agentEmail,
          subject: subject,
          html: html,
        };
        sgMail.send(msg);
        res.send({ result: "success", data: user });
      }
    }
  );
});

router.post("/send_demo_email", async function (req, res, next) {
  const uniqueId = uuidv4();
  const { formatted_address, email, cc_email, stillwater_pricing, universal_pricing, enhanced_pricing, coverage_a } = req.body;
  let isPDFError = false;
  const params = Object.assign(req.body, { uniqueId });
  const pdf = new Pdf();
  await pdf.generateBindPDF(params).catch(() => (isPDFError = true));
  if (isPDFError) {
    res.send({
      result: "success",
      msg: "An error occurred while creating invoice PDF",
    });
    return;
  }
  let pdfurl = "";
  let pdf_path = "";
  if (uniqueId) {
    let domain = req.headers.origin;
    pdfurl = domain + "/pdfs/" + uniqueId + ".pdf";
    pdf_path = "./pdfs/" + uniqueId + ".pdf";
  }
  let templateParam = {
    ...req.body,
    support_email: config.demoData.email,
    support_phone: config.demoData.phone,
    pdfurl,
  };
  const templateFile = swig.compileFile(appDir + "/templates/demo_email.twig");
  fs.writeFileSync(appDir + "/templates/demo_email.html", emailHeader + emailFooter);
  const emailContent = templateFile(templateParam);
  const html = emailHeader + emailContent + emailFooter;
  const msg1 = {
    //from: config.agentEmail,
    from: mailFrom,
    to: email,
    subject: "Homeowners Insurance - " + formatted_address,
    html: html,
    attachments: [
      {
        //filename: 'attachment.pdf',
        //contentType: 'application/pdf',
        // disposition: "attachment",
        //content: fs.readFileSync(pdf_path).toString("base64"),

        filename: 'attachment.pdf',
        content: fs.createReadStream(pdf_path)
      },
    ],
  };
  const msg2 = {
    //to: config.adminEmail,
    from: mailFrom,
    to: config.adminEmail,
    subject: "Homeowners Insurance - " + formatted_address,
    html: html,
    attachments: [
      {
        /*filename: "attachment.pdf",
        type: "application/pdf",
        disposition: "attachment",
        content: fs.readFileSync(pdf_path).toString("base64"),*/

        filename: 'attachment.pdf',
        content: fs.createReadStream(pdf_path)
      },
    ],
  };
  if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(cc_email)) {
    //  msg1["cc"] = cc_email;
  }

  //await sgMail.send(msg1);
  //await sgMail.send(msg2);
  var res1 = transporter.sendMail(msg1, function (err, info) {
    if (err) {
      console.log(err)
    } else {
      console.log(info);
    }
  });

  var res2 = transporter.sendMail(msg2, function (err, info) {
    if (err) {
      console.log(err)
    } else {
      console.log(info);
    }
  });

  res.send({
    result: "success",
    msg: "successfully received.",
  });
});

router.post("/get_pdf_link", async function (req, res, next) {
  const uniqueId = uuidv4();
  const { formatted_address, email, cc_email, stillwater_pricing, universal_pricing, enhanced_pricing, coverage_a } = req.body;
  let isPDFError = false;
  const params = Object.assign(req.body, { uniqueId });
  const pdf = new Pdf();
  await pdf.generateBindPDF(params).catch(() => (isPDFError = true));
  if (isPDFError) {
    res.send({
      result: "success",
      msg: "An error occurred while creating invoice PDF",
    });
    return;
  }
  let pdfurl = "";
  let pdf_path = "";
  if (uniqueId) {
    let domain = req.headers.origin;
    pdfurl = domain + "/pdfs/" + uniqueId + ".pdf";
    pdf_path = "./pdfs/" + uniqueId + ".pdf";
  }
  let templateParam = {
    ...req.body,
    support_email: config.demoData.email,
    support_phone: config.demoData.phone,
    pdfurl,
  };

  res.send({
    result: pdf_path,
    msg: "successfully received.",
  });
});

router.post("/send_details_email", (req, res, next) => {
  const data = ({
    quoteID,
    premium,
    dwelling_value,
    structures,
    personal_property,
    loss_of_use,
    liability,
    med_to_pay,
    water_backup,
    service_line,
    home_system,
    address,
    start_date,
    quote_date,
    dwelling_extension,
    foundation,
    building_type,
    roof_type,
    construction_type,
    exterior_type,
    apiType,
    personData,
    static_address,
    mortgage_data,
    built_year,
    roof_year,
    ac_year,
    electric_year,
    plumbing_year,
  } = req.body);
  const emailTemplate = swig.compileFile(appDir + "/templates/details_email.twig");
  const html = emailHeader + emailTemplate(data) + emailFooter;
  fs.writeFileSync(appDir + "/templates/details_email.html", html);
  const msg = {
    from: config.agentEmail,
    to: config.adminEmail,
    subject: address + " - Account Update",
    html: html,
  };
  sgMail
    .send(msg)
    .then(() => {
      res.send({
        result: "success",
        msg: "successfully received",
      });
    })
    .catch(() => {
      res.send({
        result: "error",
        msg: "An error occurred while sending email",
      });
    });
});

router.post("/send_mail", function (req, res, next) {
  const data = ({ address, built_year, square, foundation, RoofShape, RoofType, roof_year, electric_year, plumbing_year, ac_year, construction_type, exterior_type, personData, HomeType, phone, email } = req.body);
  const emailTemplate = swig.compileFile(appDir + "/templates/details_email1.twig");
  const html = emailHeader + emailTemplate(data) + emailFooter;
  fs.writeFileSync(appDir + "/templates/details_email.html", html);
  const msg = {
    /* from: config.agentEmail, */
    from: mailFrom,
    to: [config.adminEmail],
    subject: address + " - Account Update",
    html: html,
  };
  res.status(200).send({
    msg
  })

  // var res1 = transporter.sendMail(msg, function (err, info) {
  //   if (err) {
  //     console.log(err);
  //     res.send({
  //       result: "error",
  //       msg: "An error occurred while sending email",
  //     });
  //   } else {
  //     console.log(info);
  //     res.send({
  //       result: "success",
  //       msg: "successfully received",
  //     });
  //   }
  // });

  /*sgMail
    .send(msg)
    .then(() => {
      res.send({
        result: "success",
        msg: "successfully received",
      });
    })
    .catch(() => {
      res.send({
        result: "error",
        msg: "An error occurred while sending email",
      });
    });*/
});

// Nationwide api code.
router.post("/get_nationwide", async function (req, res, next) {
  console.log(req.body)
  try {
    var params = req.body;

    const discount = params['bundleDiscount'] ? {
      "eligibleDiscounts": [
        { "name": "Home and Car", "selectedOptionValue": "NationwideAutoPolicy", "eligibleDiscountId": "HomeCarIndicator_I" }
      ]
    } : null


    var data = {
      "policyHolders": [
        {
          "emailAddress": params.email,
          "policyHolderType": "PolicyPriNamedInsured",
          "person": {
            "firstName": params.personData[0].first_name,
            "middleName": "",
            "lastName": params.personData[0].last_name,
            "dateOfBirth": params.personData[0].birthday,
            "gender": "M",
            "maritalStatus": "S"
          }
        }
      ],
      "policyAddress": {
        "addressLine1": params.street,
        "city": params.city,
        "state": params.state,
        "postalCode": params.postal_code
      },
      "offeredQuotes": [
        {
          "coverages": [
            {
              "coverageId": "PersonalLiability",
              "coverageLevel": "Policy",
              "selectedValue": [
                {
                  "code": "PersonalLiabilityLimit",
                  "value": params.basic['liability']
                }
              ]
            },
            {
              "coverageId": "DwellingReplacementCost",
              "coverageLevel": "Dwelling",
              "selectedValue": [
                {
                  "code": "selected",
                  "value": params.basic['dwelling_extension']
                }
              ]
            },
            {
              "coverageId": "SectionIDeductibles",
              "coverageLevel": "Dwelling",
              "selectedValue": [
                {
                  "code": "AllPerilDeductible",
                  "value": params.basic['deductible']
                }
              ]
            },
            {
              "coverageId": "BasicCoverage",
              "coverageLevel": "Dwelling",
              "selectedValue": [
                {
                  "code": "BasicCoverageLimit",
                  "value": params.basic['dwelling']
                }
              ]
            },
            {
              "coverageId": "WaterBackupLimited",
              "coverageLevel": "Dwelling",
              "selectedValue": [
                {
                  "code": "WaterBackupLimitedLimit",
                  "value": params.basic['water_backup'] ? 10000 : 0
                }
              ]
            },
            {
              "coverageId": "ServiceLine",
              "coverageLevel": "Dwelling",
              "selectedValue": [
                {
                  "code": "selected",
                  "value": params.basic['service_line'] ? 10000 : 0
                }
              ]
            },
            {
              "coverageId": "EquipmentBreakdown",
              "coverageLevel": "Dwelling",
              "selectedValue": [
                {
                  "code": "selected",
                  "value": params.basic['equipment_breakdown']
                }
              ]
            }
          ]
        }
      ],
      "producer": {
        "producerCode": "00060164 - 002",
        "type": "Internet"
      },
      "creditConsent": true,
      "yearsWithPriorCarrier": "02",
      "coveredLocation": {
        "datePurchased": "2018-01-01",
        "constructionInfo": {
          "squareFootage": params.sqft,
          "yearBuilt": params.year_built,
          "numberOfStories": "2.0"
        }
      },
      ...discount


    }
    var header = {
      "Accept": "*/*",
      "Content-Type": "application/json",
      "client_id": config.nationwide.client_id,
      "Accept-Encoding": "gzip, deflate, br",
      "X-NW-Message-ID": "abc-123-87ab"
    };
    var options = {
      method: 'POST',
      uri: 'https://api-stage.nationwide.com/customer-acquisition/homeowners-sales-experience/v1/rated-quotes',
      headers: header,
      body: data,
      json: true // Automatically stringifies the body to JSON
    };
    var result = [];
    // console.log("Nationwide Option List:", options);
    // console.log(
    //   "emailAddress", params.email,
    //   "policyHolderType", "PolicyPriNamedInsured",
    //   "firstName", params.personData[0].first_name,
    //   "middleName", "",
    //   "lastName", params.personData[0].last_name,
    //   "dateOfBirth", params.personData[0].birthday,
    //   "addressLine1", params.street,
    //   "city", params.city,
    //   "state", params.state,
    //   "postalCode", params.postal_code,
    //   "value", params.basic['liability'],
    //   "value", params.basic['dwelling_extension'],
    //   "value", params.basic['deductible'],
    //   "value", params.basic['dwelling'],
    //   "value", params.basic['water_backup'],
    //   "value", params.basic['service_line'],
    //   "value", params.basic['equipment_breakdown']


    // )

    request(options, function (error, response, body) {
      if (error) {
        res.send({
          result: "error",
          msg: "An error occurred while get nationwide price get",
        });
      } else {
        result['basic'] = body;
        // var output = { basic: result['basic'], better: {}, best: {} };
        // console.log("output", output);
        // res.send({
        //   result: output,
        //   msg: "successfully received",
        // });




        var data = {
          "policyHolders": [
            {
              "emailAddress": params.email,
              "policyHolderType": "PolicyPriNamedInsured",
              "person": {
                "firstName": params.personData[0].first_name,
                "middleName": "",
                "lastName": params.personData[0].last_name,
                "dateOfBirth": params.personData[0].birthday,
                "gender": "M",
                "maritalStatus": "S"
              }
            }
          ],
          "policyAddress": {
            "addressLine1": params.street,
            "city": params.city,
            "state": params.state,
            "postalCode": params.postal_code
          },
          "offeredQuotes": [
            {
              "coverages": [
                {
                  "coverageId": "PersonalLiability",
                  "coverageLevel": "Policy",
                  "selectedValue": [
                    {
                      "code": "PersonalLiabilityLimit",
                      "value": params.better['liability']
                    }
                  ]
                },
                {
                  "coverageId": "DwellingReplacementCost",
                  "coverageLevel": "Dwelling",
                  "selectedValue": [
                    {
                      "code": "selected",
                      "value": params.better['dwelling_extension']
                    }
                  ]
                },
                {
                  "coverageId": "SectionIDeductibles",
                  "coverageLevel": "Dwelling",
                  "selectedValue": [
                    {
                      "code": "AllPerilDeductible",
                      "value": params.better['deductible']
                    }
                  ]
                },
                {
                  "coverageId": "BasicCoverage",
                  "coverageLevel": "Dwelling",
                  "selectedValue": [
                    {
                      "code": "BasicCoverageLimit",
                      "value": params.better['dwelling']
                    }
                  ]
                },
                {
                  "coverageId": "WaterBackupLimited",
                  "coverageLevel": "Dwelling",
                  "selectedValue": [
                    {
                      "code": "WaterBackupLimitedLimit",
                      "value": params.better['water_backup'] ? 10000 : 0
                    }
                  ]
                },
                {
                  "coverageId": "ServiceLine",
                  "coverageLevel": "Dwelling",
                  "selectedValue": [
                    {
                      "code": "selected",
                      "value": params.better['service_line'] ? 10000 : 0
                    }
                  ]
                },
                {
                  "coverageId": "EquipmentBreakdown",
                  "coverageLevel": "Dwelling",
                  "selectedValue": [
                    {
                      "code": "selected",
                      "value": params.better['equipment_breakdown']
                    }
                  ]
                }
              ]
            }
          ],
          "producer": {
            "producerCode": "00060164 - 002",
            "type": "Internet"
          },
          "creditConsent": true,
          "yearsWithPriorCarrier": "02",
          "coveredLocation": {
            "datePurchased": "2018-01-01",
            "constructionInfo": {
              "squareFootage": params.sqft,
              "yearBuilt": params.year_built,
              "numberOfStories": "2.0"
            }
          },
          ...discount

        }
        var options = {
          method: 'POST',
          uri: 'https://api-stage.nationwide.com/customer-acquisition/homeowners-sales-experience/v1/rated-quotes',
          headers: header,
          body: data,
          json: true // Automatically stringifies the body to JSON
        };
        request(options, function (error1, response1, body1) {
          if (error1) {
            res.send({
              result: "error",
              msg: "An error occurred while get nationwide price get",
            });
          } else {
            result['better'] = body1;
            console.log('____i am better____', body1)

            var data = {
              "policyHolders": [
                {
                  "emailAddress": params.email,
                  "policyHolderType": "PolicyPriNamedInsured",
                  "person": {
                    "firstName": params.personData[0].first_name,
                    "middleName": "",
                    "lastName": params.personData[0].last_name,
                    "dateOfBirth": params.personData[0].birthday,
                    "gender": "M",
                    "maritalStatus": "S"
                  }
                }
              ],
              "policyAddress": {
                "addressLine1": params.street,
                "city": params.city,
                "state": params.state,
                "postalCode": params.postal_code
              },
              "offeredQuotes": [
                {
                  "coverages": [
                    {
                      "coverageId": "PersonalLiability",
                      "coverageLevel": "Policy",
                      "selectedValue": [
                        {
                          "code": "PersonalLiabilityLimit",
                          "value": params.best['liability']
                        }
                      ]
                    },
                    {
                      "coverageId": "DwellingReplacementCost",
                      "coverageLevel": "Dwelling",
                      "selectedValue": [
                        {
                          "code": "selected",
                          "value": params.best['dwelling_extension']
                        }
                      ]
                    },
                    {
                      "coverageId": "SectionIDeductibles",
                      "coverageLevel": "Dwelling",
                      "selectedValue": [
                        {
                          "code": "AllPerilDeductible",
                          "value": params.best['deductible']
                        }
                      ]
                    },
                    {
                      "coverageId": "BasicCoverage",
                      "coverageLevel": "Dwelling",
                      "selectedValue": [
                        {
                          "code": "BasicCoverageLimit",
                          "value": params.best['dwelling']
                        }
                      ]
                    },
                    {
                      "coverageId": "WaterBackupLimited",
                      "coverageLevel": "Dwelling",
                      "selectedValue": [
                        {
                          "code": "WaterBackupLimitedLimit",
                          "value": params.best['water_backup'] ? 10000 : 0
                        }
                      ]
                    },
                    {
                      "coverageId": "ServiceLine",
                      "coverageLevel": "Dwelling",
                      "selectedValue": [
                        {
                          "code": "selected",
                          "value": params.best['service_line'] ? 10000 : 0
                        }
                      ]
                    },
                    {
                      "coverageId": "EquipmentBreakdown",
                      "coverageLevel": "Dwelling",
                      "selectedValue": [
                        {
                          "code": "selected",
                          "value": params.best['equipment_breakdown']
                        }
                      ]
                    }
                  ]
                }
              ],
              "producer": {
                "producerCode": "00060164 - 002",
                "type": "Internet"
              },
              "creditConsent": true,
              "yearsWithPriorCarrier": "02",
              "coveredLocation": {
                "datePurchased": "2018-01-01",
                "constructionInfo": {
                  "squareFootage": params.sqft,
                  "yearBuilt": params.year_built,
                  "numberOfStories": "2.0"
                }
              },
              ...discount


            }

            var options = {
              method: 'POST',
              uri: 'https://api-stage.nationwide.com/customer-acquisition/homeowners-sales-experience/v1/rated-quotes',
              headers: header,
              body: data,
              json: true // Automatically stringifies the body to JSON
            };
            request(options, function (error2, response2, body2) {
              if (error1) {
                res.send({
                  result: "error",
                  msg: "An error occurred while get nationwide price get",
                });
              } else {
                result['best'] = body2;


                if (error2) {
                  res.send({
                    result: "error",
                    msg: "An error occurred while get nationwide price get",
                  });
                } else {
                  result['best'] = body2;
                  var output = { basic: body, better: body1, best: body2 };
                  console.log("output", output);
                  res.send({
                    result: output,
                    msg: "successfully received",
                  });
                }



                // var data = {
                //   "policyHolders": [
                //     {
                //       "emailAddress": params.email,
                //       "policyHolderType": "PolicyPriNamedInsured",
                //       "person": {
                //         "firstName": params.personData[0].first_name,
                //         "middleName": "",
                //         "lastName": params.personData[0].last_name,
                //         "dateOfBirth": params.personData[0].birthday,
                //         "gender": "M",
                //         "maritalStatus": "S"
                //       }
                //     }
                //   ],
                //   "policyAddress": {
                //     "addressLine1": params.street,
                //     "city": params.city,
                //     "state": params.state,
                //     "postalCode": params.postal_code
                //   },
                //   "offeredQuotes": [
                //     {
                //       "coverages": [
                //         {
                //           "coverageId": "PersonalLiability",
                //           "coverageLevel": "Policy",
                //           "selectedValue": [
                //             {
                //               "code": "PersonalLiabilityLimit",
                //               "value": params.best['liability']
                //             }
                //           ]
                //         },
                //         {
                //           "coverageId": "DwellingReplacementCost",
                //           "coverageLevel": "Dwelling",
                //           "selectedValue": [
                //             {
                //               "code": "selected",
                //               "value": params.best['dwelling_extension']
                //             }
                //           ]
                //         },
                //         {
                //           "coverageId": "SectionIDeductibles",
                //           "coverageLevel": "Dwelling",
                //           "selectedValue": [
                //             {
                //               "code": "AllPerilDeductible",
                //               "value": params.best['deductible']
                //             }
                //           ]
                //         },
                //         {
                //           "coverageId": "BasicCoverage",
                //           "coverageLevel": "Dwelling",
                //           "selectedValue": [
                //             {
                //               "code": "BasicCoverageLimit",
                //               "value": params.best['dwelling']
                //             }
                //           ]
                //         },
                //         {
                //           "coverageId": "WaterBackupLimited",
                //           "coverageLevel": "Dwelling",
                //           "selectedValue": [
                //             {
                //               "code": "WaterBackupLimitedLimit",
                //               "value": params.best['water_backup']
                //             }
                //           ]
                //         },
                //         {
                //           "coverageId": "ServiceLine",
                //           "coverageLevel": "Dwelling",
                //           "selectedValue": [
                //             {
                //               "code": "selected",
                //               "value": params.best['service_line']
                //             }
                //           ]
                //         },
                //         {
                //           "coverageId": "EquipmentBreakdown",
                //           "coverageLevel": "Dwelling",
                //           "selectedValue": [
                //             {
                //               "code": "selected",
                //               "value": params.best['equipment_breakdown']
                //             }
                //           ]
                //         }
                //       ]
                //     }
                //   ],
                //   "producer": {
                //     "producerCode": "00060164 - 002",
                //     "type": "Internet"
                //   },
                //   "creditConsent": true,
                //   "yearsWithPriorCarrier": "02",
                //   "coveredLocation": {
                //     "datePurchased": "2018-01-01",
                //     "squareFootage": params.sqft,
                //     "yearBuilt": params.year_built,
                //     "numberOfStories": "2.0"
                //   }
                // };
                // var options = {
                //   method: 'POST',
                //   uri: 'https://api-stage.nationwide.com/customer-acquisition/homeowners-sales-experience/v1/rated-quotes',
                //   headers: header,
                //   body: data,
                //   json: true // Automatically stringifies the body to JSON
                // };
                // request(options, function (error2, response2, body2) {
                //   if (error2) {
                //     res.send({
                //       result: "error",
                //       msg: "An error occurred while get nationwide price get",
                //     });
                //   } else {
                //     result['best'] = body2;
                //     var output = { basic: body, better: body1, best: body2 };
                //     console.log("output", output);
                //     res.send({
                //       result: output,
                //       msg: "successfully received",
                //     });
                //   }
                // });
              }
            });
          }
        });
      }
    })
  } catch (err) { console.log(err) }
});


router.post('/send_search_address_email', function (req, res, next) {
  const msg = {
    /* from: config.agentEmail, */
    from: mailFrom,
    to: 'faizan@karigar.pk',
    subject: "I am testing this",
    html: 'html',
  };
  transporter.sendMail(msg, function (err, info) {
    if (err) {
      console.log(err);
      res.send({
        result: "error",
        msg: "An error occurred while sending email",
      });
    } else {
      console.log(info);
      res.send({
        result: "success",
        msg: "successfully received",
      });
    }
  });

})


router.post("/send_selected_buy_mail", function (req, res, next) {
  const data = ({ address, personData, selected_insurance_data } = req.body);
  const emailTemplate = swig.compileFile(appDir + "/templates/selected_insurance_mail.twig");
  const html = emailHeader + emailTemplate(data) + emailFooter;
  fs.writeFileSync(appDir + "/templates/details_email.html", html);
  const msg = {
    /* from: config.agentEmail, */
    from: mailFrom,
    to: config.adminEmail,
    subject: address + " - Buy Selection",
    html: html,
  };

  var res1 = transporter.sendMail(msg, function (err, info) {
    if (err) {
      console.log(err);
      res.send({
        result: "error",
        msg: err,
      });
    } else {
      console.log(info);
      res.send({
        result: "success",
        msg: "successfully received",
      });
    }
  });
});


// function that calls property details api accepting the property id and returns the required  object
async function getPropertyInfo(propertyId) {
  return new Promise((resolve) => {
    if (propertyId) {
      var req = unirest("GET", config.RealtorConfig.endpoint.property_details);

      req.query({
        property_id: propertyId,
      });
      req.header = req.headers(setRapidApiHeader());

      req.end(async function (res) {
        if (res.error) {
          console.log("error");
          resolve(null);
        }
        console.log("success");
        if (res.body && res.body.properties && res.body.properties.length > 0) {
          const resp = {
            year_built: res.body.properties[0].year_built || res.body.properties[0].public_records[0].year_built,
            price: res.body.properties[0].price,
            building_size: res.body.properties[0].building_size.size || res.body.properties[0].public_records[0].building_sqft,
          };
          resolve(resp);
        }
      });
    } else {
      resolve(null);
    }
  });
}

function setRapidApiHeader() {
  return {
    "x-rapidapi-host": config.RealtorConfig.settings.host,
    "x-rapidapi-key": config.RealtorConfig.settings.key,
    useQueryString: true,
  };
}

module.exports = router;

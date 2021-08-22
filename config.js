const config = {
    zillow_api: "X1-ZWz184acmu85qj_46au6",
    // sendgrid: "GPTk6spkQC2fRTPmgKvXVw",
    sendgrid: "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",
    hostname: 'boom.insure',
    certificateInfo: {
      cert: './cert/__neighborlyins_com.crt',
      ca: './cert/__neighborlyins_com.ca-bundle',
      key: './cert/__neighborlyins_com.key'
    },
	nationwide:{
      client_id:'J3ilG3FuRqVG47T3IUarkqXInTiF1NWw',
      secret:'4jd5YeywLdZDNOgh'
    },
    adminEmail: 'hughz49@gmail.com',
    agentEmail: 'moe@boomcovered.com',
    demoData: {
      first_name: 'Peter',
      last_name: 'Hughes',
      birthday: '1990-02-19',
      email: 'demo@boomcovered.com',
      phone: '610-864-1155',

    },
    plymouth: {
      code: 3079600,
      phone_number: 6106999000
    },
    haven: {
      source: 'PINNACLE_CLIENT'
    },
    ApiInfo: {
      isAutoAPI: false,
      iSAPITestMode:
        true,
      accountName:
        'XMLCNG',
      homeAPIToken:
        'JK33NT',
      CustPermId:
        'xmlcngtest',
      CustLoginId: 'xmlcngtest',
      HomeAPIURL: 'https://api-qua.stillwaterinsurance.com/api/services/rest/home/quote/v1.0',
      BindAPIURL:
        'https://api-qua.stillwaterinsurance.com/api/services/rest/home/bind/v1.0',
      // BindAPIURL:'https://api.stillwaterinsurance.com/api/services/rest/home/bind/v1.0',
      DocAPIURL:
        'https://api-qua.stillwaterinsurance.com/api/docs/',
      // DocAPIURL:'https://api.stillwaterinsurance.com/api/docs/',
    },
    universalUsername: 'pinnacle',
    universalPwd: 'Cw144kybPcw2zyrf',
    weatherAPIToken:
      '0b9d062ddef25fb8c0653b7b3be6d1e3',
    universalData:
      {
        roofMaterials: [
          {
            OptionGroupId: '1',
            Name: 'Aluminum,\n      Corrugated',
            Value: '15041'
          },
          {
            OptionGroupId: '1',
            Name: 'Built-Up/Tar\n      and Gravel',
            Value: '15004',
            Description:
              'Three to five layers of roofing felt\n      laminated with coal tar, pitch or asphalt, and topped with a layer of gravel or other aggregate material.\n      Typically found on flat or low-pitched roofs.',
            ImageUrl: 'img/roof/tarGravel.gif'
          },
          {OptionGroupId: '1', Name: 'Hail\n      Proof', Value: '15039'},
          {
            OptionGroupId: '1',
            Name: 'Rolled\n      Roof/Single Ply',
            Value: '15040'
          },
          {
            OptionGroupId: '1',
            Name: 'Rubber',
            Value: '15009',
            Description:
              'Roof\n      covering using flexible elastomeric plastic/rubberized materials applied in rolls. The seams are vulcanized.',
            ImageUrl: 'img/roof/rubber.gif'
          },
          {
            OptionGroupId: '1',
            Name: 'Shakes,\n      Wood',
            Value: '15002',
            Description:
              'Shakes split from a bolt of wood, generally\n      in random dimensions. Wood shakes are normally installed over a pitched roof on spaced sheathing covered with a\n      vapor barrier.',
            ImageUrl: 'img/roof/woodshakes.gif'
          },
          {
            OptionGroupId: '1',
            Name: 'Shingles,\n      Architectural',
            Value: '15502'
          },
          {
            OptionGroupId: '1',
            Name: 'Shingles,\n      Asphalt/Fiberglass',
            Value: '15001',
            Description:
              'Shingles made of felt or\n      inorganic fiberglass saturated with asphalt and surfaced with mineral granules. Also called composition\n      shingles, these may be made in individual strips, interlocking and self-sealing. Asphalt shingles are normally\n      applied on medium pitched roofs over solid sheathing and a vapor barrier.',
            ImageUrl: 'img/roof/asphaltshingles.gif'
          },
          {
            OptionGroupId: '1',
            Name: 'Shingles,\n      Wood',
            Value: '15013',
            Description:
              'Overlapping, tapered pieces of wood,\n      generally in random dimensions. Wood pine shingles are installed over a pitched roof on spaced sheathing covered\n      with a vapor barrier.',
            ImageUrl: 'img/roof/woodShingles.gif'
          },
          {
            OptionGroupId: '1',
            Name: 'Slate',
            Value: '15003',
            Description:
              'A\n      dense, fine grained, metamorphic rock produced by the compression of various sediments, cut into thin tiles or\n      slabs. Slate comes in any number of sizes, thicknesses and finishes.',
            ImageUrl: 'img/roof/slate.gif'
          },
          {OptionGroupId: '1', Name: 'Steel', Value: '15011'},
          {
            OptionGroupId: '1',
            Name: 'Tile,\n      Clay',
            Value: '15005',
            Description:
              'A roof made from different types of clay and\n      fired in kilns to dry. Clay tiles can be divided into two categories: flat or roll. Clay tiles are either\n      tapered or straight and S shaped or barrel shaped with interlocking sidelaps or side joints.',
            ImageUrl: 'img/roof/clayTile.gif'
          },
          {
            OptionGroupId: '1',
            Name: 'Tile,\n      Concrete',
            Value: '15006',
            Description:
              'A thin piece of concrete made from\n      Portland cement, fine aggregate, and pigments. Concrete tiles can be manufactured to resemble clay tile or wood\n      shakes, and can be either tapered or straight and barrel shaped with interlocking sidelaps or side joints.',
            ImageUrl: 'img/roof/concreteTile.gif'
          },
          {
            OptionGroupId: '1',
            Name: 'Tile,\n      Mission',
            Value: '15007'
          },
          {
            OptionGroupId: '1',
            Name: 'Tile,\n      Spanish',
            Value: '15008'
          },
          {
            OptionGroupId: '1',
            Name: 'Tin',
            Value: '15010',
            Description:
              'A\n      thin gauge sheet of tin (terne) that is typically fastened with an interlocking standing seam system. The seams\n      are either flat or raised. Tin alloys have a long life span and are a premium cost product. Tin roofs are not to\n      be confused with the steel roofs commonly found on pre-engineered structures.',
            ImageUrl: 'img/roof/tin.gif'
          }],
        states:
          [{StateId: '2', StateCode: 'AK', StateDescription: 'Alaska'},
            {StateId: '3', StateCode: 'AL', StateDescription: 'Alabama'},
            {StateId: '4', StateCode: 'AR', StateDescription: 'Arkansas'},
            {StateId: '6', StateCode: 'AZ', StateDescription: 'Arizona'},
            {StateId: '9', StateCode: 'CA', StateDescription: 'California'},
            {StateId: '10', StateCode: 'CO', StateDescription: 'Colorado'},
            {
              StateId: '11',
              StateCode: 'CT',
              StateDescription: 'Connecticut'
            },
            {
              StateId: '12',
              StateCode: 'DC',
              StateDescription: 'District of Columbia'
            },
            {StateId: '13', StateCode: 'DE', StateDescription: 'Delaware'},
            {StateId: '15', StateCode: 'FL', StateDescription: 'Florida'},
            {StateId: '17', StateCode: 'GA', StateDescription: 'Georgia'},
            {StateId: '21', StateCode: 'HI', StateDescription: 'Hawaii'},
            {StateId: '22', StateCode: 'IA', StateDescription: 'Iowa'},
            {StateId: '23', StateCode: 'ID', StateDescription: 'Idaho'},
            {StateId: '24', StateCode: 'IL', StateDescription: 'Illinois'},
            {StateId: '25', StateCode: 'IN', StateDescription: 'Indiana'},
            {StateId: '26', StateCode: 'KS', StateDescription: 'Kansas'},
            {StateId: '27', StateCode: 'KY', StateDescription: 'Kentucky'},
            {StateId: '28', StateCode: 'LA', StateDescription: 'Louisiana'},
            {
              StateId: '30',
              StateCode: 'MA',
              StateDescription: 'Massachusetts'
            },
            {StateId: '32', StateCode: 'MD', StateDescription: 'Maryland'},
            {StateId: '33', StateCode: 'ME', StateDescription: 'Maine'},
            {StateId: '35', StateCode: 'MI', StateDescription: 'Michigan'},
            {StateId: '36', StateCode: 'MN', StateDescription: 'Minnesota'},
            {StateId: '37', StateCode: 'MO', StateDescription: 'Missouri'},
            {
              StateId: '39',
              StateCode: 'MS',
              StateDescription: 'Mississippi'
            },
            {StateId: '40', StateCode: 'MT', StateDescription: 'Montana'},
            {
              StateId: '42',
              StateCode: 'NC',
              StateDescription: 'North Carolina'
            },
            {
              StateId: '43',
              StateCode: 'ND',
              StateDescription: 'North Dakota'
            },
            {StateId: '44', StateCode: 'NE', StateDescription: 'Nebraska'},
            {
              StateId: '46',
              StateCode: 'NH',
              StateDescription: 'New Hampshire'
            },
            {
              StateId: '47',
              StateCode: 'NJ',
              StateDescription: 'New Jersey'
            },
            {
              StateId: '48',
              StateCode: 'NM',
              StateDescription: 'New Mexico'
            },
            {StateId: '52', StateCode: 'NV', StateDescription: 'Nevada'},
            {StateId: '54', StateCode: 'NY', StateDescription: 'New York'},
            {StateId: '55', StateCode: 'OH', StateDescription: 'Ohio'},
            {StateId: '56', StateCode: 'OK', StateDescription: 'Oklahoma'},
            {StateId: '58', StateCode: 'OR', StateDescription: 'Oregon'},
            {
              StateId: '59',
              StateCode: 'PA',
              StateDescription: 'Pennsylvania'
            },
            {
              StateId: '61',
              StateCode: 'PR',
              StateDescription: 'Puerto Rico'
            },
            {
              StateId: '65',
              StateCode: 'RI',
              StateDescription: 'Rhode Island'
            },
            {
              StateId: '67',
              StateCode: 'SC',
              StateDescription: 'South Carolina'
            },
            {
              StateId: '68',
              StateCode: 'SD',
              StateDescription: 'South Dakota'
            },
            {StateId: '72', StateCode: 'TN', StateDescription: 'Tennessee'},
            {StateId: '73', StateCode: 'TX', StateDescription: 'Texas'},
            {StateId: '74', StateCode: 'UT', StateDescription: 'Utah'},
            {StateId: '75', StateCode: 'VA', StateDescription: 'Virginia'},
            {StateId: '78', StateCode: 'VT', StateDescription: 'Vermont'},
            {
              StateId: '79',
              StateCode: 'WA',
              StateDescription: 'Washington'
            },
            {StateId: '80', StateCode: 'WI', StateDescription: 'Wisconsin'},
            {
              StateId: '81',
              StateCode: 'WV',
              StateDescription: 'West Virginia'
            },
            {StateId: '82', StateCode: 'WY', StateDescription: 'Wyoming'},
            {StateId: '86', StateCode: 'AA', StateDescription: undefined},
            {StateId: '90', StateCode: 'AE', StateDescription: undefined},
            {StateId: '91', StateCode: 'AP', StateDescription: undefined}],
        exteriors:
          [
            {
              Construction: 'Light Wood Frame',
              Siding: 'Brick',
              MaterialId: '10016'
            },
            {
              Construction: 'Light Wood Frame',
              Siding: 'EIFS',
              MaterialId: '10041'
            },
            {
              Construction: 'Light Wood Frame',
              Siding: 'Stone',
              MaterialId: '10022'
            },
            {
              Construction: 'Light Wood Frame',
              Siding: 'Stucco',
              MaterialId: '10014'
            },
            {Construction: 'Frame', Siding: 'Brick', MaterialId: '10016'},
            {Construction: 'Frame', Siding: 'EIFS', MaterialId: '10041'},
            {Construction: 'Frame', Siding: 'Stone', MaterialId: '10022'},
            {Construction: 'Frame', Siding: 'Stucco', MaterialId: '10014'},
            {Construction: 'Masonry', Siding: 'Stone', MaterialId: '10024'},
            {
              Construction: 'Masonry',
              Siding: 'Stucco',
              MaterialId: '10015'
            },
            {
              Construction: 'Light Wood Frame',
              Siding: 'Aluminum',
              MaterialId: '10012'
            },
            {
              Construction: 'Light Wood Frame',
              Siding: 'Hardboard',
              MaterialId: '10039'
            },
            {
              Construction: 'Light Wood Frame',
              Siding: 'Stone',
              MaterialId: '10026'
            },
            {
              Construction: 'Light Wood Frame',
              Siding: 'Vinyl',
              MaterialId: '10013'
            },
            {
              Construction: 'Light Wood Frame',
              Siding: 'Wood',
              MaterialId: '10004'
            },
            {
              Construction: 'Light Wood Frame',
              Siding: 'Wood',
              MaterialId: '10003'
            },
            {
              Construction: 'Frame',
              Siding: 'Aluminum',
              MaterialId: '10012'
            },
            {
              Construction: 'Frame',
              Siding: 'Hardboard',
              MaterialId: '10039'
            },
            {Construction: 'Frame', Siding: 'Stone', MaterialId: '10026'},
            {Construction: 'Frame', Siding: 'Vinyl', MaterialId: '10013'},
            {Construction: 'Frame', Siding: 'Wood', MaterialId: '10004'},
            {Construction: 'Frame', Siding: 'Wood', MaterialId: '10003'},
            {
              Construction: 'Masonry',
              Siding: 'Aluminum',
              MaterialId: '10012'
            },
            {
              Construction: 'Masonry',
              Siding: 'Hardboard',
              MaterialId: '10039'
            },
            {Construction: 'Masonry', Siding: 'Stone', MaterialId: '10026'},
            {Construction: 'Masonry', Siding: 'Vinyl', MaterialId: '10013'},
            {Construction: 'Masonry', Siding: 'Wood', MaterialId: '10004'},
            {Construction: 'Masonry', Siding: 'Wood', MaterialId: '10003'},
            {
              Construction: 'Masonry',
              Siding: 'Hardboard',
              MaterialId: '10016'
            },
            {Construction: 'Masonry', Siding: 'Brick', MaterialId: '10016'}],
        roofShapes:
          [
            {
              OptionGroupId: '5',
              Name: 'Flat',
              Value: 'Flat',
              Description: 'A flat roof is horizontal or nearly horizontal.',
              ImageUrl: 'img/roofshape/flat.png'
            },
            {
              OptionGroupId: '5',
              Name: 'Gable',
              Value: 'Gable',
              Description:
                'A type of roof containing sloping planes of the same pitch on each side of the ridge. Contains a gable\n      at each end.',
              ImageUrl: 'img/roofshape/gable.png'
            },
            {
              OptionGroupId: '5',
              Name: 'Gambrel',
              Value: 'Gambrel',
              Description:
                'A type of roof containing two sloping planes of different pitch on each side of the ridge. The lower\n      plane has a steeper slope than the upper. Contains a gable at each end.',
              ImageUrl: 'img/roofshape/gambrel.png'
            },
            {
              OptionGroupId: '5',
              Name: 'Hip',
              Value: 'Hip',
              Description:
                'A type of roof containing sloping planes of the same pitch on each of four sides. Contains no gables.',
              ImageUrl: 'img/roofshape/hip.png'
            },
            {
              OptionGroupId: '5',
              Name: 'Mansard',
              Value: 'Mansard',
              Description:
                'A type of roof containing two sloping planes of different pitch on each of four sides. The lower plane\n      has a much steeper pitch than the upper, often approaching vertical. Contains no gables.',
              ImageUrl: 'img/roofshape/mansard.png'
            },
            {
              OptionGroupId: '5',
              Name: 'Butterfly',
              Value: 'Butterfly',
              Description:
                'A roof shape which has two surfaces that rise from the center to the eaves with a valley in the center;\n      resembles the wings of a butterfly',
              ImageUrl: 'img/roofshape/butterfly.png'
            },
            {
              OptionGroupId: '5',
              Name: 'Shed',
              Value: 'Shed',
              Description:
                'A roof containing only one sloping plane. Has no hips, ridges, valleys or gables.',
              ImageUrl: 'img/roofshape/shed.png'
            },
            {OptionGroupId: '5', Name: 'Other', Value: 'Other'}],
        constructionTypes:
          [
            {
              OptionGroupId: '9',
              Name: 'Frame Light Wood (Single Wall)',
              Value: 'Light Wood Frame',
              Description:
                'Single wall (studless) construction framed with light timber trusses.'
            },
            {
              OptionGroupId: '9',
              Name: 'Frame (Double Wall)',
              Value: 'Frame',
              Description:
                'Stud walls are typically constructed of 2x4 inch or 2x6 inch wood members vertically set 16 or 24\n      inches apart. Exterior wall of wood or other combustible construction, including wood iron-clad, stucco on wood or\n      plaster on combustible supports. Includes aluminum or plastic siding over frame.'
            },
            {
              OptionGroupId: '9',
              Name: 'Masonry',
              Value: 'Masonry',
              Description:
                'Exterior walls constructed of masonry materials such as adobe, brick, concrete, gypsum block, hollow\n      concrete block, stone, tile or similar materials and floors and roof of combustible construction (Disregarding\n      floors resting directly on the ground).'
            }],
        foundationTypes:
          [
            {
              OptionGroupId: '6',
              Name: 'Open',
              Value: 'Open',
              Description:
                'In an open foundation, the building is supported\r\nby piles or piers, and the bottom of the first-floor\r\nframing is several feet above-grade Piles and piers are constructed of concrete,masonry, timber, or steel.',
              ImageUrl: 'img/foundation/open_thumb.png'
            },
            {
              OptionGroupId: '6',
              Name: 'Piers',
              Value: 'Piers',
              Description:
                'Pier foundation is a grid system of girders (beams), piers, and footings used in construction to elevate the superstructure above the ground plane or grade. The piers serve as columns for the superstructure.',
              ImageUrl: 'img/foundation/piers_thumb.png'
            },
            {
              OptionGroupId: '6',
              Name: 'Slab',
              Value: 'Slab',
              Description:
                'A continuous slab of concrete, generally reinforced with steel re-bar or steel wire mesh, laid over the ground as a foundation for a structure.',
              ImageUrl: 'img/foundation/slab_thumb.png'
            },
            {
              OptionGroupId: '6',
              Name: 'Crawl Space',
              Value: 'Crawl Space',
              Description:
                'An excavated or unexcavated foundation area below a residence, less than 5 feet in depth, that is generally used for access to plumbing and heating equipment. It can also be used for storage.',
              ImageUrl: 'img/foundation/crawlspace_thumb.png'
            },
            {
              OptionGroupId: '6',
              Name: 'Basement',
              Value: 'Basement',
              Description:
                'A basement is an excavated area below the ground floor, typically at least 8 feet in depth, which includes the walls, a slab floor, and a stairway from the ground floor. Note: To qualify as a basement, you should be able to stand up in the space. If not, it is probably a crawl space.',
              ImageUrl: 'img/foundation/basement_thumb.png'
            },
            {
              OptionGroupId: '6',
              Name: 'Closed',
              Value: 'Closed',
              Description:
                'A continuous slab of concrete, generally reinforced with steel re-bar or steel wire mesh, laid over the ground as a foundation for a structure.',
              ImageUrl: 'img/foundation/slab_thumb.png'
            },
            {
              OptionGroupId: '6',
              Name: 'Pilings',
              Value: 'Pilings',
              Description:
                'In an open foundation, the building is supported\r\nby piles or piers, and the bottom of the first-floor\r\nframing is several feet above-grade Piles and piers are constructed of concrete,masonry, timber, or steel.',
              ImageUrl: 'img/foundation/open_thumb.png'
            },
            {
              OptionGroupId: '6',
              Name: 'Stilts',
              Value: 'Stilts',
              Description:
                'In an open foundation, the building is supported\r\nby piles or piers, and the bottom of the first-floor\r\nframing is several feet above-grade Piles and piers are constructed of concrete,masonry, timber, or steel.',
              ImageUrl: 'img/foundation/open_thumb.png'
            },
            {
              OptionGroupId: '6',
              Name: 'Lattice',
              Value: 'Lattice',
              Description:
                'In an open foundation, the building is supported\r\nby piles or piers, and the bottom of the first-floor\r\nframing is several feet above-grade Piles and piers are constructed of concrete,masonry, timber, or steel.',
              ImageUrl: 'img/foundation/open_thumb.png'
            }]
      },

    neptune: {
      username: 'FL13352',
      password: 'FL13352.',
      host: 'https://uat-api.neptuneflood.com',
      key: 'A62FAE40-6933-428D-859C-B206FFAE5E7A'
    },
    RealtorConfig: {
      endpoint: {
          property_details: "https://realtor.p.rapidapi.com/properties/v2/detail",
          location_lookup: "https://realtor.p.rapidapi.com/locations/auto-complete"
      },
      settings:{
          key:"599a1bf29fmsha4c4b41a52a8228p138cbejsnbbfb265c093a",
          host: "realtor.p.rapidapi.com"
      }
   },
    hippo: {
      production:{
        auth_token:'kMGra60EMRHCSYYCENYo6WXWXkp8KxO42R9cucoZPcFpJ4kv2lHplVi2QmqwqCny'
      },
      staging:{
        auth_token:'JRl0a6zTGpMXCeSeS4vBUGvEy390iVVYSNKqI96T3A8y9aCFysMh0CefaPaW2j2h'
      }
    }
  }
;
module.exports = config;
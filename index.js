const axios = require('axios');

const notifyUrls = [
  'PASTE IN AN IFTTT LINK HERE'
];

exports.handler = (event, context, callback) => {
  axios({
    method: 'get',
    url: 'https://primenow.amazon.com/s?maxResults=10&k=oatly&ref=nb_sb_noss_1',
    headers: {
      'Cookie': process.env.COOKIE
    }
  })
  .then((response) => {
    const currentOatly = JSON.parse(process.env.ISOATLY);
    if (response.data.noResults) {
      if(currentOatly.length > 0) {
        let oatlyString = currentOatly.map((item) => item.title).join(', ');
        notifyUrls.forEach((url) => axios({
          method: 'post',
          url,
          data: {
            value1: 'OatlyChecker: ' + oatlyString + ' is now out of stock.',
            value2: '',
            value3: response.config.url
          }
        }).then(() => console.log('Success pulling IFTTT webhook')));
      }
      return callback('No oatly available.', null);
    }
    let oatlies = [];
    response.data.products.asinCards.forEach((product, index) => {
      oatlies.push({
        asin: product.asin,
        imgUrl: product.productImgSrc,
        title: product.title,
        url: 'https://primenow.amazon.com' + product.productUrl,
        price: product.price.fullPrice
      });
    });
    let oatlyTitles = oatlies.map((oatly) => oatly.title).join(', ');
    if(process.env.ISOATLY === JSON.stringify(oatlies)) {
      console.log({
        statusCode: 201,
        data: 'Already sent push, but the oatly is PRESENT!'
      }, JSON.stringify(oatlies));
      return callback(null, {
        statusCode: 201,
        data: 'Already sent push, but the oatly is PRESENT!'
      })
    }
    notifyUrls.forEach((url) => axios({
      method: 'post',
      url,
      data: {
        value1: oatlyTitles,
        value2: oatlies[0].imgUrl,
        value3: request.config.url
      }
    })).then(() => console.log('Success pulling a webhook.'));
    process.env.ISOATLY = JSON.stringify(oatlies);
    console.log(JSON.stringify({
      statusCode: 200,
      data: 'Got dem oatlies: ' + oatlyTitles
    }));
    return callback(null, {
      statusCode: 200,
      data: 'Got dem oatlies: ' + oatlyTitles
    });
  });
};

process.env.TEST === 'TRUE' ? console.log(exports.handler(null, null, (err, data) => console.log(err, data))) : null;

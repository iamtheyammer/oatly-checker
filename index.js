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
      if (response.data.noResults) {
        process.env.ISOATLY = 'FALSE';
        return callback('No oatly available.', null);
      }
      let oatlyNames = [];
      let oatlyURL = '';
      response.data.products.asinCards.forEach((product, index) => {
        oatlyNames.push(product.title);
        if(index === 0) oatlyURL = 'https://primenow.amazon.com' + product.productUrl;

      });
      let oatlyString = oatlyNames.join(', ');
      if(process.env.ISOATLY === 'TRUE') return callback(null, {
        statusCode: 201,
        data: 'Already sent push, but the oatly is PRESENT!.'
      })
      notifyUrls.forEach((url) => axios({
        method: 'post',
        url,
        data: {
          value1: oatlyString,
          value2: 'built by iamtheyammer: git.io/fjkGt'
        }
      }));
      process.env.ISOATLY = 'TRUE';
      return callback(null, {
        statusCode: 200,
        data: 'Got dem oatlies: ' + oatlyString
      });
    });
};

process.env.TEST === 'TRUE' ? console.log(exports.handler(null, null, (err, data) => console.log(data))) : null;

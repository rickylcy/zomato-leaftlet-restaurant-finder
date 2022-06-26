require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser') //Get request
const path = require('path')
const Zomato = require('zomato.js')
const engine = require('ejs-mate');
const zomato = new Zomato('813c82d3a71214cbd7ac5223340ddf36')
const AWS = require('aws-sdk');
const redis = require('redis');
const responseTime = require('response-time');
const { APIGateway } = require('aws-sdk');





const app = express() // creating express app.
app.engine('ejs', engine);
app.set('view engine', 'ejs');

const client = redis.createClient();
client.on('error', (err) => {
  console.log("Error " + err);
});

// Cloud Services Set-up
// Create unique bucket name
const bucketName = 'redis-zomato-store';


// Create a promise on S3 service object
const bucketPromise = new AWS.S3({ apiVersion: '2006-03-01' }).createBucket({ Bucket: bucketName }).promise();
bucketPromise.then(function (data) {
  console.log("Successfully created " + bucketName);
})
  .catch(function (err) {
    console.error(err, err.stack);
  });

app.use(express.static(path.join(__dirname, 'static'))) //want to use the static library.. __dirname is magic name for current directory.
app.use(bodyParser.urlencoded({ extended: false }))


app.use(require('./routes/'));

var isrediss3 = 0;
//make post request to the server
app.post('/search', async (req, res) => {

  try {
    isrediss3 = 0;
    const list = [
      ['Sydney', '260'],
      ['Brisbane', '298'],
      ['Melbourne', '259'],
      ['Canberra', '313'],
      ['Darwin', '1323'],
      ['Perth', '296'],
      ['Adelaide', '297'],
      ['Hobart', '216']
    ];
    var cityid; //for passing the cityid
    console.log(list);
    //q is the query that user send.
    const cityq = req.body.q;

    var query = cityq.split(",");
    var q = query[0];
    var city = query[1];
    var s3Key;

    for (let i = 0; i < 8; i++) {
      if (list[i][0] == city) {
        cityid = list[i][1];
        break;
      }
    }


    console.log("HAHAHHAHA");
    console.log(cityid);
    console.log(q);
    //for (let i = 0; i < cityq.length; i++)
    //{

    //}

    console.log(city);


    client.get(`zomato:${q}${city}`, async (err, result) => {
      if (result) {
        isrediss3 = 1;
        console.log("inside redissss");
        const resultJSON = JSON.parse(result);
        //   console.log(resultJSON);
        return res.status(200).json(resultJSON);
      } else {
        isrediss3 = 1;
        s3Key = `zomato:${q},${city}`;
        console.log(s3Key);
        const params = { Bucket: bucketName, key: s3Key };
        return new AWS.S3({ apiVersion: '2006-03-01' }).getObject(params, (err, result) => {
          // console.log(result);
          if (result) {
            console.log("inside the s3 bucket thingy");
            //     console.log(result);
            const responseJSON = result.data;
            client.setex(`zomato:${q}`, 3600, JSON.stringify(responseJSON));
            return res.json({ source: 'S3 Bucket', ...responseJSON, });
          }
          //no redis no s3.
          // else {

        });
      }
    })
    if (isrediss3 == 0) {
      console.log("not inside redis or s3");
      const data = await zomato.search({ entity_id: cityid, entity_type: 'city', q });

      const restaurants = data.restaurants.map(r => {
        return {
          name: r.name,
          url: r.url,
          location: r.location,
          lat: r.location.latitude,
          long: r.location.longitude,
          address: r.location.address,
          locality: r.location.locality,
          price: r.price_range,
          thumbnail: r.thumb,
          rating: r.user_rating.aggregate_rating,
          timings: r.timings,
        }
      })
      const responseJSON = restaurants;
      const body = JSON.stringify({ source: 'S3 Bucket', ...responseJSON });
      const objectParams = { Bucket: bucketName, Key: s3Key, Body: body };
      client.setex(`zomato:${q}`, 3600, JSON.stringify({ source: 'Redis Cache', ...responseJSON, }));
      const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' }).putObject(objectParams).promise();
      uploadPromise.then(function (data) {
        console.log("Successfully uploaded data to " + bucketName + "/" + s3Key);
      });

      res.json({ restaurants })
    }
    //   console.log(restaurants);
    //  }
  } catch (err) {
    console.error(err)
    res.status(500).send('There is some error retrieving the data......')
  }

})


//serves on localhost:3000
app.listen(3000, () => console.log('server started on port 3000'))

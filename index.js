require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { hostname } = require('os');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({extended: true}));

app.use('/public', express.static(`${process.cwd()}/public`));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const shortenedUrls = [];

// Attempt to redirected to given short url.
// If short url doesn't exist, return error.
app.get('/api/shorturl/:shortId(\\d+)', function(req, res) {
  const id = parseInt(req.params.shortId);
  if(id < shortenedUrls.length && id >= 0) {
    res.redirect(shortenedUrls[id]);
  } else {
    res.json({"error": "No short URL found for the given input"});
  }
});

app.get('/api/shorturl/*', function(req, res) {
  res.json({ "error": "Wrong format" });
});

// Shorten URL and return its new id.
// If URL isn't valid return error.
app.post('/api/shorturl', function(req, res) {
  const url = req.body['url'];
  var hostname = undefined;
  try {
    hostname = new URL(url).hostname
  } catch {}

  if(hostname == undefined) {
    console.log('Error: could not convert', url, 'to URL.');
    res.json({"error": "Invalid URL"});
    return
  }

  console.log('Hostname: ', hostname);

  dns.lookup(hostname, (err) => {
    if(err == null) {
      id = shortenedUrls.length;
      shortenedUrls.push(url);

      console.log(shortenedUrls);

      res.json({
        "original_url": url,
        "short_url": id
      });
    } else {
      res.json({"error": "Invalid URL"});
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

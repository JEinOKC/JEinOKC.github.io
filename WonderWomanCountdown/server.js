var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + 'public/index.html'))
})

app.listen(port, function () {
  console.log('Example app listening on port 3000!')
})

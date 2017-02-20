var express = require('express');
var fs = require('fs');
var app = express();

app.use(express.static(__dirname));

app.listen(3003, function () {
  console.log('Example app listening on port 3003!')
})
'use strict';

const express = require('express');

const PORT = 8080;

const app = express();

app.get('/', function (req, res) {
	res.send('Hello World\n');
});

app.listen(PORT);


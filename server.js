'use strict';
const express = require('express');
const app = express();

app.use('/', express.static(__dirname + '/public'));
app.use(function (req, res, next) {
	res.set('Cache-control', 'max-age=0,no-cache')
	next();
});
app.get('/page1', function (req, res) {
	res.send(`<!DOCTYPE html>
		<html>
			<head>
				<link href="/css-trick/main.css?parts=[/css-trick/shared.css,/css-trick/page1.css]" rel="stylesheet" />
			</head>
			<body>
		<a href="/page2">page2</a>
<script src="/main.js"></script>
			</body>
		</html>
	`)
});

app.get('/page2', function (req, res) {
	res.send(`<!DOCTYPE html>
		<html>
			<head>
				<link href="/css-trick/main.css?parts=[/css-trick/shared.css,/css-trick/page2.css]" rel="stylesheet" />
			</head>
			<body>
		<a href="/page1">page1</a>
<script src="/main.js"></script>
			</body>
		</html>
	`)
});

app.listen(process.env.PORT || 3000, function () {
	console.log('listening on 3000');
});


// <a href="https://cloud.githubusercontent.com/assets/447559/11320679/89d6057a-9099-11e5-9c4b-0feae958997b.png" target="_blank"><img src="https://cloud.githubusercontent.com/assets/447559/11320679/89d6057a-9099-11e5-9c4b-0feae958997b.png" alt="with" style="max-width:100%;"></a></p>
// <p><a href="https://cloud.githubusercontent.com/assets/447559/11320678/89d4ed34-9099-11e5-9b4e-b9b392bc45c4.png" target="_blank"><img src="https://cloud.githubusercontent.com/assets/447559/11320678/89d4ed34-9099-11e5-9b4e-b9b392bc45c4.png" alt="without" style="max-width:100%;"></a></p>

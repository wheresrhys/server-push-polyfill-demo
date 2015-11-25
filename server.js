'use strict';
const express = require('express');
const app = express();

app.use('/', express.static(__dirname + '/public'));
app.use(function (req, res, next) {
	res.set('Cache-control', 'max-age=0,no-cache')
	next();
});
app.get
app.get('/polyfill-demo', function (req, res) {
	const minute = Math.floor(Date.now()/20000);
	let html = '';

	const article = `
		<article class="markdown-body entry-content" itemprop="mainContentOfPage"><h1><a id="user-content-proof-of-concept-for-using-service-worker-to-polyfill-server-push" class="anchor" href="#proof-of-concept-for-using-service-worker-to-polyfill-server-push" aria-hidden="true"><span class="octicon octicon-link"></span></a>Proof of concept for using service worker to polyfill server push</h1>

<h2><a id="user-content-how-it-works" class="anchor" href="#how-it-works" aria-hidden="true"><span class="octicon octicon-link"></span></a>How it works</h2>

<p>The server sets an <code>x-server-push</code> header on the main html response which lists any files which should be 'pushed' by the server. On fetch the service worker checks for this header and fires off a response for each path specified, storing the requests in memory.</p>

<p>When the browser then attempts to fetch these resources they are intercepted by the service worker and respond with the request that was kicked off earlier by the service worker.</p>

<h2><a id="user-content-impact" class="anchor" href="#impact" aria-hidden="true"><span class="octicon octicon-link"></span></a>Impact</h2>

<h3><a id="user-content-with" class="anchor" href="#with" aria-hidden="true"><span class="octicon octicon-link"></span></a>With</h3>

<p>Note the very fast response for the js. The effect on css is negligeable, though this test page has an unrealistically tiny <code>&lt;head&gt;</code>, so in the real world there could be a small but very real improvement

<h3><a id="user-content-without" class="anchor" href="#without" aria-hidden="true"><span class="octicon octicon-link"></span></a>Without</h3>


<h2><a id="user-content-limitations" class="anchor" href="#limitations" aria-hidden="true"><span class="octicon octicon-link"></span></a>Limitations</h2>

<ul>
<li>Still have to wait for the round trip for html to send its headers before the 'push'es can begin.
The most time you'll save is the time it takes to download (inbound journey online) and parse your html page,
but even on high performance websites this will be a saving of ~100ms... and if you're on a high
performance website you'll already know ~100ms is a respectable dent</li>
<li>Possibly a bad idea to do this for too many requests unless your site is already on http2 -
kicking off an extra early http request for js could delay the loading of other resources, eg. images, fonts</li>
</ul>

<h2><a id="user-content-todo" class="anchor" href="#todo" aria-hidden="true"><span class="octicon octicon-link"></span></a>TODO</h2>

<ul>
<li>interacting properly with cache - the 'push' should store in cache and the real requests from the page should check cache before checking the inFlight object</li>
</ul>
</article>
`;
let i = 0;
while (i++ < 20) {
	html+= article;
}

	res.set('x-server-push', `/main.css?hash=${minute},/main.js?hash=${minute}`)
	res.send(`<!DOCTYPE html>
		<html>
			<head>
				<link href="/main.css?hash=${minute}" rel="stylesheet" />
			</head>
			<body>
		${html}
<script src="/main.js?hash=${minute}"></script>
			</body>
		</html>
	`)
})

app.listen(process.env.PORT || 3000, function () {
	console.log('listening on 3000');
});


// <a href="https://cloud.githubusercontent.com/assets/447559/11320679/89d6057a-9099-11e5-9c4b-0feae958997b.png" target="_blank"><img src="https://cloud.githubusercontent.com/assets/447559/11320679/89d6057a-9099-11e5-9c4b-0feae958997b.png" alt="with" style="max-width:100%;"></a></p>
// <p><a href="https://cloud.githubusercontent.com/assets/447559/11320678/89d4ed34-9099-11e5-9b4e-b9b392bc45c4.png" target="_blank"><img src="https://cloud.githubusercontent.com/assets/447559/11320678/89d4ed34-9099-11e5-9b4e-b9b392bc45c4.png" alt="without" style="max-width:100%;"></a></p>

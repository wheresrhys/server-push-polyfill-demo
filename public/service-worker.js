/* globals self, caches, clients */
'use strict';
const cacheName = 'css-trick';



self.addEventListener('install', function () {
	// console.log('install')
});

self.addEventListener('activate', function() {
	// console.log('activate')
	if (self.clients && clients.claim) {
		clients.claim();
	}
});

self.addEventListener('fetch', function (event) {
	var request = event.request;
	// console.log('real fetch', request.url)
	if (/\?parts=/.test(request.url)) {
		const urls = /\?parts=\[([^\]]+)\]/.exec(request.url)[1].split(',');

		// console.log('trying to find in cache', request.url)
		return event.respondWith(
			Promise.all(
				urls.map(url => fetch(url).then(res => res.text()))
			)
				.then(texts => texts.join('\n'))
				.then(text => new Response(text, {
					status: 200,
					headers: {
						'Content-Type':'text/css; charset=UTF-8'
					}
				})
			)
		);
	}

	event.respondWith(fetch(request))
	return;
});
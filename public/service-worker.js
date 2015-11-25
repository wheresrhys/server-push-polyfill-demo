/* globals self, caches, clients */
'use strict';
const cacheName = 'server-push-polyfill';

const inFlight = {}

function putInCache(request, res) {
	const copy = res.clone();
	return caches.open(cacheName)
		.then(function (cache) {
			return cache.put(request, copy);
		});
}

self.addEventListener('install',function(event) {
	console.log('install')
});

self.addEventListener('activate', function() {
	console.log('activate')
	if (self.clients && clients.claim) {
		clients.claim();
	}
});

self.addEventListener('fetch', function(event) {
	var request = event.request;
	console.log('real fetch', request.url)
	if (/\.(css|js)/.test(request.url)) {
		console.log('trying to find in cache', request.url)
		return event.respondWith(
      caches.match(request)
        .then(function (response) {

        	if (response) {
        		console.log('delivering cached', request.url);
        		return response.clone();
        	}
        	if (inFlight[request.url]) {
						console.log('delivering server push', request.url);
						return inFlight[request.url];
					}
					console.log('failed to find in cache', request.url)
					return fetch(request);

        })
    );
	}

	event.respondWith(
		fetch(request)
			.then(res => {
				const pushes = res.headers.get('x-server-push');

				if (pushes) {
					pushes.split(',').forEach(path => {
						path = 'http://localhost:3000' + path
						const pushyRequest = new Request(path);
						caches.match(pushyRequest)
							.then(res => {
								console.log('back from cache', path)
								if (!res) {
									console.log('sending server push', path)
									inFlight[path] = fetch(pushyRequest)
										.then(res => {
											console.log('server push arrived', path);
											putInCache(pushyRequest, res)
												.then(() => {
													console.log('deleting inFlight', path)
													delete inFlight[path];
												})
											return res.clone()
										})
								}
							})

					})
				}
				return res;
			})
	);
	return;
});
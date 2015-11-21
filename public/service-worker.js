/* globals self, caches, clients */
'use strict';
const cacheName = 'server-push-polyfill';


const inFlight = {}


self.addEventListener('install',function(event) {
	console.log('install')
	// event.waitUntil(
	// 	caches.open(cacheName).then(function(cache) {
	// 		return cache.addAll([
	// 		]);
	// 	})
	// );
});

self.addEventListener('activate', function() {
	console.log('activate')
	if (self.clients && clients.claim) {
		clients.claim();
	}
});

self.addEventListener('fetch', function(event) {
	var request = event.request;
	if (inFlight[request.url]) {
		console.log('gotim', request.url);
		event.respondWith(inFlight[request.url]);
		delete inFlight[request.url];
		return;
	}

	event.respondWith(
		fetch(request)
			.then(res => {
				const pushes = res.headers.get('x-server-push');

				if (pushes) {
					pushes.split(',').forEach(path => {
						path = 'http://localhost:3000' + path
						const request = new Request(path);
						console.log('sending', path)
						inFlight[path] = fetch(request)
							.then(res => {
								console.log('cameback', path);
								// delete inFlight[path];
								// var	 copy = res.clone();
				// 				caches.open(cacheName)
				// 					.then(function (cache) {
				// 						cache.put(request, copy);
				// 					});
				// 				})
								return res
							})
					})
				}
				return res;
			})
	);
	return;
});
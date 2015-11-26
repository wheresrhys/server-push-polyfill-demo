# Proof of concept for using service worker to polyfill server push

**TL;DR - Shave a few 100ms off your javascript load time for repeat visitors**

## The problem being solved

Service worker caching is great, but for a site with a release cycle that's more rapid than the frequency of most users' visits (such as [the one](https://next.ft.com) I spend most of my time working on at the moment), more often than not the cache won't contain the javacript file the page is requesting. Server push would solve this problem but isn't readily available yet, not even at the server level, let alone in the CDN. 

So what follows is an attempt to be a little cleverer with how service-worker intercepts requests in order to emulate server push.

## How it works

The server sets an `x-server-push` header on the main html response which lists any files which should be 'pushed' by the server. On fetch the service worker checks for this header and fires off a request for each path specified, storing the requests in memory. As soon as they respond they are added to the service worker cache and the inmemory references are deleted.

When the browser then attempts to fetch these resources they are intercepted by the service worker, which responds with the cached response, or the in-flight request, or a fresh request (in that order of preference)

## Impact

Throttling requests to imitate 3G, here are the timelines for 3 page loads: 

- fresh
- first request after service worker registered but no requests cached
- subsequent request with cache fully populated

![request timelines for all 3 page loads](https://cloud.githubusercontent.com/assets/447559/11410150/1e2ca0dc-93bd-11e5-8521-e59250ce0d46.png)

The first page load, as you'd expect, is (just about) the slowest and the last one, by a wide margin, is the fastest. What is not quite so obvious is that on the second page load the css and javascript start to download almost immediately

![request timeline detail for second page load](https://cloud.githubusercontent.com/assets/447559/11410434/390a344e-93bf-11e5-8e53-e3246d776b52.png)

This results in a performance gain, for defered javascript, approximately equal to:

```
(html page weight / bandwidth) + time to parse html
```

An exemplary scientific survey (conducted very recently by a source extremely well known to me) suggests a typical saving (on 3G) of 100 - 500ms for well performing sites, but stretching to several seconds for many others (for whom service worker hackery shouldn't really be first on their performance todo list).

## Limitations

* Still have to wait for the round trip for html to send its headers before the 'push'es can begin. The effect of latency and processing time on the server will not change (although it increases the benefits of a server that sends its headers as early as possible)
* Arguably not worth doing for CSS as CSS files tend to be included in the html `<head>`
* Possibly a bad idea to do this for too many requests unless your site is already on http2 - kicking off an extra early http request for js could delay the loading of other resources, eg. images, fonts, not to mention the rest of your html page
* It will only really benefit users who come to your site for sessions spaced wider apart than your release cycle and/or ttl for static assets
e.g If you release daily and they visit weekly they will get a faster javascript load on the first page view of their next visit

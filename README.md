# Proof of concept for using service worker to polyfill server push

## How it works

The server sets an `x-server-push` header on the main html response which lists any files which should be 'pushed' by the server. On fetch the service worker checks for this header and fires off a response for each path specified, storing the requests in memory.

When the browser then attempts to fetch these resources they are intercepted by the service worker and respond with the request that was kicked off earlier by the service worker.

## Impact

### With
Note the very fast response for the js. The effect on css is negligeable, though this test page has an unrealistically tiny `<head>`, so in the real world there could be a small but very real improvement
![with](https://cloud.githubusercontent.com/assets/447559/11320679/89d6057a-9099-11e5-9c4b-0feae958997b.png)

### Without 
![without](https://cloud.githubusercontent.com/assets/447559/11320678/89d4ed34-9099-11e5-9b4e-b9b392bc45c4.png)


## Limitations
 - Still have to wait for the round trip for html to send its headers before the 'push'es can begin
 - The responsive picture element makes pushing images somewhat redundant (although the same is true of real server push)
 - Possibly a bad idea unless your site is already on http2 - kicking off an extra early http request for js could delay the loading of other resources, eg. images, fonts

## TODO
- interacting properly with cache - the 'push' should store in cache and the real requests from the page should check cache before checking the inFlight object
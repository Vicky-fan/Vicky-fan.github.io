console.log("Hello from ServiceWorker land!");

const version = 'jing_20171211';
const cacheName = 'jingPWA_20171211';

const offlineResources = [
    '/',
    '/offline.html'
];
//
function cacheKey() {
    return [version, ...arguments].join(':');
}
//
/**
 * Install 安装
 */

function onInstall(event) {
    console.log('install event in progress.');

    event.waitUntil(
        caches.open(cacheName)
        .then(cache => cache.addAll(offlineResources))
        .then(() => console.log('installation complete! version: ' + version))
        .then(() => self.skipWaiting())
    );
}

//
// /**
//  * Activate
//  */
//
function removeOldCache() {
    return caches
        .keys()
        .then(keys =>
            Promise.all( // 等待所有旧的资源都清理完成
                keys
                .filter(key => !key.startsWith(version)) // 过滤不需要删除的资源
                .map(key => caches.delete(key)) // 删除旧版本资源，返回为 Promise 对象
            )
        )
        .then(() => {
            console.log('removeOldCache completed.');
        });
}

function onActivate(event) {
    console.log('activate event in progress.');
    event.waitUntil(Promise.all([
        // 更新客户端
        self.clients.claim(),
        removeOldCache()
    ]))
}


/**
 * Fetch
 */

// 当网络离线或请求发生了错误，使用离线资源替代 request 请求
function offlineResponse(request) {
    console.log('(offline)', request.method, request.url);
    if (request.url.match(/\.(jpg|png|gif|svg|jpeg)(\?.*)?$/)) {
        return caches.match('/wp-content/themes/Kratos/images/default.jpg');
    } else {
        return caches.match('/offline.html');
    }
}

// 从缓存读取或使用离线资源替代
function cachedOrOffline(request) {
    return caches
        .match(request)
        .then((response) => response || offlineResponse(request));
}

// 从网络请求，并将请求成功的资源缓存
function networkedAndCache(request) {
    return fetch(request)
        .then(response => {
            const copy = response.clone();

            caches.open(cacheKey('resources'))
                .then(cache => {
                    cache.put(request, copy);
                });

            console.log("(network: cache write)", request.method, request.url);
            return response;
        });
}

// 优先从 cache 读取，读取失败则从网络请求并缓存。网络请求也失败，则使用离线资源替代
function cachedOrNetworked(request) {
    return caches.match(request)
        .then((response) => {
            console.log(response ? '(cached)' : '(network: cache miss)', request.method, request.url);
            return response ||
                networkedAndCache(request)
                .catch(() => offlineResponse(request));
        });
}

// 优先从网络请求，失败则使用离线资源替代
function networkedOrOffline(request) {
    return fetch(request)
        .then(response => {
            console.log('(network)', request.method, request.url);
            return response;
        })
        .catch(() => offlineResponse(request));
}

// 不需要缓存的请求
function shouldAlwaysFetch(request) {
    return request.method !== 'GET';
}

// 缓存 html 页面
function shouldFetchAndCache(request) {
    return (/text\/html/i).test(request.headers.get('Accept'));
}

function onFetch(event) {
    const request = event.request;

    // 应当永远从网络请求的资源
    // 如果请求失败，则使用离线资源替代
    if (shouldAlwaysFetch(request)) {
        console.log('AlwaysFetch request: ', event.request.url);
        event.respondWith(networkedOrOffline(request));
        return;
    }

    // 应当从网络请求并缓存的资源
    // 如果请求失败，则尝试从缓存读取，读取失败则使用离线资源替代
    if (shouldFetchAndCache(request)) {
        event.respondWith(
            networkedAndCache(request).catch(() => cachedOrOffline(request))
        );
        return;
    }

    event.respondWith(cachedOrNetworked(request));
}
//
// self.addEventListener("fetch", function(event) {
//     event.respondWith(caches.match(event.request).catch(function() {
//         return fetch(event.request);
//     }).then(function(response) {
//         caches.open(version).then(function(cache) {
//             cache.put(event.request, response);
//         });
//         return response.clone();
//     }).catch(function() {
//         return caches.match('./static/mm1.jpg');
//     }));
// });
self.addEventListener('fetch', onFetch);
self.addEventListener('install', onInstall);
self.addEventListener("activate", onActivate);

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
//
self.addEventListener("fetch", function(event) {});
self.addEventListener('install', onInstall);
self.addEventListener("activate", onActivate);

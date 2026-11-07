"use strict";

const CACHE_NAME = "trinkgeldrechner-v5";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=payment-rounding-2",
  "./app.js",
  "./calculator.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(APP_ASSETS);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(cacheNames
          .filter(function (cacheName) {
            return cacheName.startsWith("trinkgeldrechner-") && cacheName !== CACHE_NAME;
          })
          .map(function (cacheName) {
            return caches.delete(cacheName);
          }));
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  if (request.method !== "GET") return;
  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request)
      .then(function (cachedResponse) {
        if (cachedResponse) return cachedResponse;
        if (request.mode === "navigate") {
          return caches.match("./index.html");
        }
        return fetch(request);
      })
  );
});

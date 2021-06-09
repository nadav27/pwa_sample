self.addEventListener('fetch', (event) => {
  // Let the browser do its default thing
  // for non-GET requests.
  if (event.request.method !== 'GET') {
      return;
  }

  event.respondWith(
      caches.match(event.request)
          .then((response) => {
              return response || fetch(event.request);
          }),
  );
});

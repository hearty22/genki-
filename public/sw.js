self.addEventListener('install', event => {
    console.log('Service worker installing...');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service worker activating...');
    event.waitUntil(clients.claim());
});

self.addEventListener('push', e => {
    const data = e.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon
    });
});
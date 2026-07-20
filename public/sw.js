// public/sw.js
// ✅ এই ফাইলটা ব্রাউজার ব্যাকগ্রাউন্ডে চলে, ট্যাব/অ্যাপ বন্ধ থাকলেও

// নতুন push notification এলে এখানে ধরা পড়ে
self.addEventListener("push", function (event) {
    let data = { title: "Farmer Kamol", body: "নতুন অর্ডার এসেছে!", url: "/admin/orders" }
  
    if (event.data) {
      try {
        data = event.data.json()
      } catch (e) {
        data.body = event.data.text()
      }
    }
  
    const options = {
      body: data.body,
      icon: "/uploads/kamol.png",
      badge: "/uploads/kamol.png",
      vibrate: [200, 100, 200],
      data: { url: data.url || "/admin/orders" },
      tag: "farmer-kamol-order",
      renotify: true,
    }
  
    event.waitUntil(
      Promise.all([
        self.registration.showNotification(data.title, options),
        // ✅ খোলা ট্যাব থাকলে সরাসরি সেখানে ডেটা পাঠাও — bell icon সাথে সাথে আপডেট হবে
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
          clientList.forEach((client) => {
            client.postMessage({
              type: "NEW_ORDER",
              orderId: data.orderId,
              name: data.name,
              amount: data.amount,
            })
          })
        }),
      ])
    )
  })
  
  // ✅ Notification-এ ট্যাপ করলে Admin Orders পেজ খুলবে
  self.addEventListener("notificationclick", function (event) {
    event.notification.close()
    const targetUrl = event.notification.data?.url || "/admin/orders"
  
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      })
    )
  })
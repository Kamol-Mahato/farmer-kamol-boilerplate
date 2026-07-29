// ✅ এই ফাইলটি সাধারণ কাস্টমার, এজেন্ট এবং অ্যাডমিন — সবার জন্যই কাজ করবে

// ১. Push Notification হ্যান্ডলার
self.addEventListener("push", function (event) {
  let data = { title: "Farmer Kamol", body: "নতুন আপডেট!", url: "/" }

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
    data: { url: data.url || "/" }, // যে লিংক ব্যাকএন্ড পাঠাবে সেটাই সেভ হবে
    tag: data.tag || "farmer-kamol-notification",
    renotify: true,
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title, options),
      // খোলা ট্যাব থাকলে মেসেজ পাঠানো
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: "NEW_NOTIFICATION",
            ...data
          })
        })
      }),
    ])
  )
})

// ২. Notification Click হ্যান্ডলার (স্মার্ট রিডাইরেক্ট)
self.addEventListener("notificationclick", function (event) {
  event.notification.close()
  
  // ব্যাকএন্ড থেকে পাঠানো আসল URL (যেমন: /admin/orders, /agent/orders, বা /blog/1)
  const targetUrl = event.notification.data?.url || "/"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      
      // ক) যদি কোনো ট্যাব অলরেডি খোলা থাকে এবং সেটিতে ম্যাচ করে, তবে সেখানে ফোকাস করো
      for (const client of clientList) {
        if (targetUrl !== "/" && client.url.includes(targetUrl) && "focus" in client) {
          return client.focus()
        }
      }

      // খ) যদি এটি অর্ডার নোটিফিকেশন হয় (URL-এ /orders থাকে)
      if (targetUrl.includes("orders")) {
        // ট্যাবগুলোর মধ্যে এজেন্ট বা অ্যাডমিন প্যানেল খোলা আছে কি না দেখা
        for (const client of clientList) {
          if (client.url.includes("/agent") && "focus" in client) {
            return client.focus()
          }
          if (client.url.includes("/admin") && "focus" in client) {
            return client.focus()
          }
        }
      }

      // গ) কোনো উপযুক্ত ট্যাব খোলা না থাকলে যেই URL রিসিভ হয়েছে সেটি নতুন ট্যাবে খোলো
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
import { prisma } from "@/lib/prisma"
import OrderStatusUpdate from "./OrderStatusUpdate"
import PaymentConfirm from "./PaymentConfirm"
import { generateCustomId, resolveOrderIdFromCustomId } from "@/lib/orderUtils"
import CourierBookButton from "./CourierBookButton"

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const resolvedParams = await params
  // ✅ URL-এ এখন FK202607211-এর মতো কাস্টম ID আসে, সেটা থেকে আসল ডাটাবেজ ID বের করা হচ্ছে
  const orderId = await resolveOrderIdFromCustomId(resolvedParams.id)

  if (!orderId) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-medium">ভুল অর্ডার আইডি!</p>
      </div>
    )
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      orderItems: {
        include: { product: true },
      },
      invoice: true,
      editLogs: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">অর্ডার পাওয়া যায়নি</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-green-800">অর্ডার #{generateCustomId(order.createdAt, order.dailySeq)}</h1>
        <div className="flex items-center gap-4">
          <a href={`/admin/orders/${order.id}/edit`} className="text-sm font-bold underline text-black">এডিট করুন</a>
          <a href="/admin/orders" className="text-blue-600 hover:underline">← ফিরে যান</a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Customer Info */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-gray-800 mb-4">কাস্টমার তথ্য</h2>
          <p className="text-gray-600"><span className="font-medium">নাম:</span> {order.customer.name}</p>
          <p className="text-gray-600 mt-2"><span className="font-medium">ফোন:</span> {order.customer.phone}</p>
          <p className="text-gray-600 mt-2"><span className="font-medium">ঠিকানা:</span> {order.deliveryAddress}</p>
          {order.customerNote && (
            <p className="text-gray-600 mt-2"><span className="font-medium">নোট:</span> {order.customerNote}</p>
          )}
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-gray-800 mb-4">অর্ডার তথ্য</h2>
          <p className="text-gray-600"><span className="font-medium">তারিখ:</span> {new Date(order.createdAt).toLocaleDateString("bn-BD")}</p>
          <p className="text-gray-600 mt-2"><span className="font-medium">পেমেন্ট:</span> {order.paymentMethod === "GATEWAY" ? "অনলাইন পেমেন্ট" : "ক্যাশ অন ডেলিভারি"}</p>
          <p className="text-gray-600 mt-2"><span className="font-medium">পেমেন্ট স্ট্যাটাস:</span> {order.paymentStatus === "PAID" ? "✅ পেইড" : "⏳ পেন্ডিং"}</p>
          <PaymentConfirm
            orderId={order.id}
            paymentMethod={order.paymentMethod}
            paymentStatus={order.paymentStatus}
            gatewayName={order.gatewayName}
            gatewayTxnId={order.gatewayTxnId}
            finalCodAmount={order.finalCodAmount}
            paymentAmountPaid={order.paymentAmountPaid}
            customerPhone={order.customer.phone}
            customOrderId={generateCustomId(order.createdAt, order.dailySeq)}
          />

          <div className="mt-4">
            <CourierBookButton
              orderId={order.id}
              alreadyBooked={!!order.courierTrackingId}
              trackingId={order.courierTrackingId}
            />
          </div>

          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">পণ্যের দাম</span>
              <span>৳ {order.totalProductPrice}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-600">ডেলিভারি চার্জ</span>
              <span>৳ {order.deliveryCharge}</span>
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t font-bold">
              <span>মোট COD</span>
              <span className="text-green-700">৳ {order.finalCodAmount}</span>
            </div>

            {/* ✅ Online payment হলে paid + due দেখাবে */}
            {order.paymentMethod === "GATEWAY" && order.paymentAmountPaid > 0 && (
              <>
                <div className="flex justify-between mt-2 text-blue-700 font-medium">
                  <span>অনলাইনে পেমেন্ট</span>
                  <span>- ৳ {order.paymentAmountPaid}</span>
                </div>
                <div className="flex justify-between mt-1 pt-2 border-t font-bold text-red-600">
                  <span>পেমেন্ট বাকী</span>
                  <span>৳ {order.finalCodAmount - order.paymentAmountPaid}</span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">পণ্য সমূহ</h2>
        {order.orderItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-0">
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-gray-400">{item.quantity} {item.product.unit}</p>
            </div>
            <p className="font-bold text-green-700">৳ {item.finalPrice}</p>
          </div>
        ))}
      </div>

      {/* Status Update */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-bold text-gray-800 mb-4">স্ট্যাটাস আপডেট</h2>
        <OrderStatusUpdate
          orderId={order.id}
          currentStatus={order.orderStatus}
          finalCodAmount={order.finalCodAmount}
          collectedAmount={order.collectedAmount}
        />
      </div>

      {/* 📝 এডিট হিস্ট্রি */}
      {order.editLogs.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="font-bold text-gray-800 mb-4">এডিট হিস্ট্রি</h2>
          <div className="space-y-3">
            {order.editLogs.map((log) => (
              <div key={log.id} className="border-b last:border-0 pb-3 text-sm">
                <p className="text-gray-500 text-xs">
                  {new Date(log.createdAt).toLocaleString("bn-BD")} — {log.editedByRole} #{log.editedById}
                </p>
                <p className="text-gray-700 mt-1">{log.changesSummary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

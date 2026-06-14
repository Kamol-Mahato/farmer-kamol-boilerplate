import { prisma } from "@/lib/prisma"
import OrderStatusUpdate from "./OrderStatusUpdate"

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const resolvedParams = await params
  const orderId = parseInt(resolvedParams.id)

  if (isNaN(orderId)) {
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
        <h1 className="text-3xl font-bold text-green-800">অর্ডার #{order.id}</h1>
        <a href="/admin/orders" className="text-blue-600 hover:underline">← ফিরে যান</a>
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
          <p className="text-gray-600 mt-2"><span className="font-medium">পেমেন্ট:</span> {order.paymentMethod}</p>
          
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
        <OrderStatusUpdate orderId={order.id} currentStatus={order.orderStatus} />
      </div>

    </div>
  )
}

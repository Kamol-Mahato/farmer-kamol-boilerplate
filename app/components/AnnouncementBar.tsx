export default function AnnouncementBar() {
  return (
    <div className="fixed top-0 left-0 w-full bg-green-950 text-white text-l py-1.5 overflow-hidden z-[60]">
      <div className="animate-marquee whitespace-nowrap inline-block">
        {[...Array(3)].map((_, i) => (
          <span key={i}>
            নমস্কার / আসসালামুআলাইকুম।&nbsp;
            <a href="/" className="text-yellow-400 font-bold hover:underline">Farmer Kamol</a>
            &nbsp;পরিবারে স্বাগতম। আমাদের পণ্য ও যেকোনো প্রয়োজনে WhatsApp অথবা কল করুন:&nbsp;
            <a href="tel:+8801737939688" className="text-yellow-400 font-bold hover:underline">
              01737939688
            </a>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        ))}
      </div>
    </div>
  )
}
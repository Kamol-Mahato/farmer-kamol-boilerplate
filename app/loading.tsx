import Image from "next/image"

export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 px-6 text-center"
      style={{ minHeight: "100dvh", backgroundColor: "#ffffff" }}
    >
      <div className="relative w-28 h-28 animate-logoPulse">
        <Image
          src="/icon.png"
          alt="Farmer Kamol"
          fill
          sizes="112px"
          priority
          className="object-contain drop-shadow-lg"
        />
      </div>
      <p className="text-green-700/80 text-sm font-medium max-w-xs">
        প্রকৃতির খাঁটি উপহার, সরাসরি কৃষকের কাছ থেকে
      </p>
    </div>
  )
}
import { ReactNode } from "react";

export default function PolicyPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-green-800">{title}</h1>
      <div className="space-y-6 text-gray-700 leading-relaxed">
        {children}
      </div>
    </main>
  );
}
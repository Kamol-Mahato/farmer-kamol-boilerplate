import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="bg-green-50 px-4 py-3 pt-12 md:pt-12">
      <div className="max-w-7xl mx-auto">
      <ol className="flex items-center flex-wrap gap-1 text-base text-xl">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <li key={index} className="flex items-center gap-1">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-green-700 hover:underline font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-gray-500" : "text-green-700 font-medium"}>
                    {item.label}
                  </span>
                )}
                {!isLast && <span className="text-gray-400 mx-1">{">"}</span>}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
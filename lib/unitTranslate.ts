const unitMap: Record<string, string> = {
  "কেজি": "KG",
  "৫০০ গ্রাম": "500 gm",
  "২৫০ গ্রাম": "250 gm",
  "গ্রাম": "gm",
  "লিটার": "liter",
  "মিলি": "ml",
  "পিস": "piece",
  "ডজন": "Dozen",
}

export function translateUnit(unit: string): string {
  return unitMap[unit] || unit
}
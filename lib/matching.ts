// Prosta logika dopasowania klienta szukającego (kupujący/najemca) do nieruchomości.
// Waży budżet (25 pkt), lokalizację (20 pkt), metraż (20 pkt), liczbę pokoi (20 pkt), typ (15 pkt).

type ClientForMatch = {
  budgetMin: number | null;
  budgetMax: number | null;
  location: string | null;
  areaMin: number | null;
  areaMax: number | null;
  rooms: number | null;
  propertyType: string | null;
};

type PropertyForMatch = {
  price: number | null;
  area: number | null;
  rooms: number | null;
  type: string;
  city: string | null;
  district: string | null;
};

export type MatchReason = { ok: boolean; text: string };
export type MatchResult = { score: number; reasons: MatchReason[] };

export function matchScore(client: ClientForMatch, property: PropertyForMatch): MatchResult {
  let score = 0;
  const reasons: MatchReason[] = [];

  // Budżet - 25 pkt
  const price = property.price ?? 0;
  const bMin = client.budgetMin ?? 0;
  const bMax = client.budgetMax ?? Infinity;
  if (price >= bMin && price <= bMax) {
    score += 25;
    reasons.push({ ok: true, text: "mieści się w budżecie" });
  } else {
    const nearest = price < bMin ? bMin : bMax;
    const diff = nearest === Infinity ? 0 : Math.abs(price - nearest) / (nearest || 1);
    if (diff <= 0.15) {
      score += 12;
      reasons.push({ ok: true, text: "blisko budżetu (±15%)" });
    } else {
      reasons.push({ ok: false, text: "poza budżetem" });
    }
  }

  // Lokalizacja - 20 pkt
  const loc = (client.location ?? "").toLowerCase().trim();
  const city = (property.city ?? "").toLowerCase();
  const district = (property.district ?? "").toLowerCase();
  if (!loc) {
    score += 10;
    reasons.push({ ok: true, text: "brak preferencji lokalizacji" });
  } else if (district.includes(loc) || loc.includes(district) || city.includes(loc) || loc.includes(city)) {
    score += 20;
    reasons.push({ ok: true, text: "preferowana lokalizacja" });
  } else {
    reasons.push({ ok: false, text: "inna lokalizacja" });
  }

  // Metraż - 20 pkt
  const area = property.area ?? 0;
  const aMin = client.areaMin ?? 0;
  const aMax = client.areaMax ?? Infinity;
  if (area >= aMin && area <= aMax) {
    score += 20;
    reasons.push({ ok: true, text: "odpowiedni metraż" });
  } else {
    const nearest = area < aMin ? aMin : aMax;
    const diff = nearest === Infinity ? 0 : Math.abs(area - nearest) / (nearest || 1);
    if (diff <= 0.1) {
      score += 10;
      reasons.push({ ok: true, text: "metraż zbliżony do oczekiwań" });
    } else {
      reasons.push({ ok: false, text: "metraż poza zakresem" });
    }
  }

  // Pokoje - 20 pkt
  const cr = client.rooms ?? 0;
  const pr = property.rooms ?? 0;
  if (!cr) {
    score += 10;
    reasons.push({ ok: true, text: "brak preferencji co do liczby pokoi" });
  } else if (cr === pr) {
    score += 20;
    reasons.push({ ok: true, text: `${pr} pokoje` });
  } else if (Math.abs(cr - pr) === 1) {
    score += 10;
    reasons.push({ ok: true, text: "zbliżona liczba pokoi" });
  } else {
    reasons.push({ ok: false, text: "inna liczba pokoi" });
  }

  // Typ nieruchomości - 15 pkt
  if (!client.propertyType) {
    score += 15;
    reasons.push({ ok: true, text: "brak preferencji typu" });
  } else if (client.propertyType === property.type) {
    score += 15;
    reasons.push({ ok: true, text: `typ: ${property.type}` });
  } else {
    reasons.push({ ok: false, text: "inny typ nieruchomości" });
  }

  return { score: Math.round(score), reasons };
}
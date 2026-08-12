# Nieruchomo CRM — szkielet produkcyjny

Ten projekt to **Faza 1** planu: prawdziwe logowanie + prawdziwa baza danych,
zamiast lokalnego zapisu w przeglądarce z prototypu. Jeden moduł (Klienci)
jest w pełni podłączony od interfejsu, przez API, aż po bazę — łącznie
z limitem 100 klientów sprawdzanym po stronie serwera. To wzór, który
powielisz dla Nieruchomości, Zadań, Kalendarza itd.

## Czego używamy i dlaczego

- **Next.js** — jeden projekt robi za front-end i backend (nie trzeba stawiać osobnego serwera).
- **Supabase** — logowanie użytkowników (rejestracja, hasła, sesje) gotowe z panelu, bez pisania tego samemu. Supabase daje też bazę PostgreSQL.
- **Prisma** — wygodny, bezpieczny dostęp do bazy z kodu TypeScript, z automatycznym uzupełnianiem pól.

## Krok 1 — Załóż konto i projekt w Supabase

1. Wejdź na [supabase.com](https://supabase.com) → **Start your project** → załóż darmowe konto.
2. Kliknij **New project**. Zapisz hasło do bazy, które tam ustawisz — będzie potrzebne za chwilę.
3. Poczekaj aż projekt się utworzy (ok. 2 minuty).

## Krok 2 — Skopiuj dane konfiguracyjne

W panelu Supabase:

- **Project Settings → API** → skopiuj `Project URL` i klucz `anon public`.
- **Project Settings → Database → Connection string**:
  - wybierz **Transaction pooler** (port 6543) → to trafi do `DATABASE_URL`
  - wybierz **Session** / bezpośrednie połączenie (port 5432) → to trafi do `DIRECT_URL`

W folderze projektu skopiuj `.env.example` jako `.env` i uzupełnij wszystkie cztery wartości.

## Krok 3 — Zainstaluj zależności

```bash
npm install
```

## Krok 4 — Utwórz tabele w bazie

```bash
npm run db:migrate
```

Zapyta o nazwę migracji — wpisz np. `init`. To polecenie czyta `prisma/schema.prisma`
i tworzy w Twojej bazie Supabase wszystkie tabele: users, clients, properties,
contacts, tasks, calendar_events, transactions, notes.

Podgląd danych w bazie (przydatne do debugowania) możesz otworzyć w każdej chwili:

```bash
npm run db:studio
```

## Krok 5 — Uruchom aplikację

```bash
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000) — zostaniesz przekierowany
na ekran logowania. Kliknij "Nie masz konta? Zarejestruj się", załóż konto testowe,
zaloguj się — trafisz na dashboard, gdzie możesz dodać klienta i zobaczyć,
że limit 100 i zapis do prawdziwej bazy działają.

## Struktura projektu

```
prisma/schema.prisma       - definicja wszystkich tabel
lib/prisma.ts               - połączenie z bazą (Prisma)
lib/supabase/client.ts      - Supabase w komponentach przeglądarkowych
lib/supabase/server.ts      - Supabase w komponentach serwerowych / API
middleware.ts                - chroni /dashboard i /api/* przed niezalogowanymi
app/login/page.tsx           - logowanie i rejestracja
app/dashboard/page.tsx       - przykładowy widok czytający dane z bazy
app/dashboard/NewClientForm.tsx - formularz wysyłający dane do API
app/api/clients/route.ts     - GET (lista) i POST (dodanie, z limitem) - WZÓR
```

## Krok 6 — Kolejne moduły (Twoja praca od teraz)

Dla każdego kolejnego modułu (Nieruchomości, Zadania, Kalendarz, Transakcje,
Notatki, Kontakty) powtórz ten sam schemat co dla Klientów:

1. Skopiuj `app/api/clients/route.ts` → `app/api/properties/route.ts` (itd.),
   podmień `prisma.client` na `prisma.property` i pola formularza. Dla
   Nieruchomości pamiętaj o limicie 50 (analogicznie jak `CLIENT_LIMIT`).
2. Dodaj stronę w `app/dashboard/...` albo zbuduj osobny routing pod `/clients`,
   `/properties` itd.
3. Wizualnie: przenieś komponenty i style z prototypu `nieruchomosci-crm.jsx`
   (sekcja `GlobalStyle`, komponenty typu `Badge`, `Modal`, `ScoreRing`) —
   sama logika dopasowania klient↔nieruchomość (`matchScore`) też jest gotowa
   do skopiowania, tylko podmień źródło danych z `useState`/`window.storage`
   na dane pobrane z `/api/...`.

## Krok 7 — Dalsze fazy (z wcześniejszego planu)

- **Faza 3 (konta i plany):** dodaj Stripe — checkout dla planu płatnego,
  webhook aktualizujący pole `plan` w tabeli `User`, wyższe limity dla planu "pro".
- **Faza 4 (twardość produkcyjna):** testy (Vitest/Playwright), wdrożenie na
  [vercel.com](https://vercel.com) (połącz repo z GitHub, dodaj te same zmienne
  środowiskowe w ustawieniach projektu na Vercelu), monitoring błędów (Sentry).

## Częste problemy

- **"Environment variable not found: DATABASE_URL"** — nie skopiowałeś/aś `.env.example` do `.env`, albo zapomniałeś/aś uzupełnić wartości.
- **Błąd połączenia z bazą przy migracji** — sprawdź, czy używasz portu **5432** (Session/direct) w `DIRECT_URL`, a **6543** (Transaction pooler) w `DATABASE_URL`.
- **Po zalogowaniu strona dashboard jest pusta / błąd Prisma** — upewnij się, że wykonałeś/aś `npm run db:migrate` zanim uruchomiłeś/aś `npm run dev`.

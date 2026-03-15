# ☕ Kawa Warsztaty — Ankieta z Dashboardem

Prosty projekt: formularz ankiety + panel z wynikami, hostowany za darmo na Vercel.

---

## Struktura projektu

```
kawa-warsztaty/
├── public/
│   ├── index.html      ← formularz ankiety (Twoja piękna strona)
│   └── results.html    ← dashboard z wynikami (chroniony hasłem)
├── api/
│   ├── submit.js       ← serverless function: przyjmuje odpowiedzi
│   └── results.js      ← serverless function: zwraca dane do dashboardu
├── vercel.json         ← konfiguracja routingu Vercel
├── package.json        ← zależności (Vercel KV)
└── README.md           ← ten plik
```

---

## Wdrożenie krok po kroku

### Krok 1 — Wrzuć na GitHub

1. Wejdź na [github.com](https://github.com) i zaloguj się
2. Kliknij **"New repository"** → nazwij np. `kawa-warsztaty` → **Create repository**
3. Na swoim komputerze, w folderze projektu, uruchom:

```bash
git init
git add .
git commit -m "Pierwszy commit – ankieta kawowa"
git remote add origin https://github.com/TWOJ_LOGIN/kawa-warsztaty.git
git push -u origin main
```

> Jeśli nie masz Git zainstalowanego lokalnie, możesz też przeciągnąć pliki bezpośrednio na GitHub przez interfejs webowy (Upload files).

---

### Krok 2 — Połącz z Vercel

1. Wejdź na [vercel.com](https://vercel.com) i zaloguj się (możesz użyć konta GitHub)
2. Kliknij **"Add New Project"**
3. Wybierz swoje repozytorium `kawa-warsztaty`
4. Kliknij **Deploy** — Vercel sam wykryje ustawienia

Po chwili dostaniesz link np. `kawa-warsztaty.vercel.app` 🎉

---

### Krok 3 — Dodaj bazę danych (Vercel KV)

To jest Redis — prosta baza klucz-wartość. Darmowa do małego ruchu.

1. W panelu Vercel, wejdź w swój projekt
2. Kliknij zakładkę **Storage**
3. Kliknij **Create** → wybierz **KV (Redis)**
4. Nazwij np. `kawa-kv` → **Create & Continue** → **Connect**

Vercel automatycznie doda zmienne środowiskowe (`KV_URL`, `KV_REST_API_URL` itp.) do Twojego projektu. Nie musisz nic wklejać ręcznie.

---

### Krok 4 — Ustaw hasło do dashboardu

1. W panelu Vercel, wejdź w projekt → **Settings** → **Environment Variables**
2. Dodaj nową zmienną:
   - **Name:** `RESULTS_KEY`
   - **Value:** wymyśl hasło, np. `espresso2024`
3. Kliknij **Save**
4. Zrób **Redeploy** (Deployments → trzy kropki → Redeploy)

---

### Krok 5 — Gotowe! Sprawdź czy działa

- **Formularz:** `https://twoja-domena.vercel.app/`
- **Wyniki:** `https://twoja-domena.vercel.app/results.html?key=espresso2024`

Możesz też wejść na `results.html` bez parametru i wpisać hasło ręcznie.

---

## Własna domena (opcjonalnie)

Jeśli chcesz mieć np. `warsztaty-kawowe.pl`:
1. Kup domenę (np. na home.pl, nazwa.pl)
2. W Vercel: **Settings** → **Domains** → dodaj domenę
3. Vercel pokaże Ci rekordy DNS do ustawienia u rejestratora

---

## Co dalej?

Kiedy zbierzesz odpowiedzi i zdecydujesz się na kolejny krok, ten projekt może urosnąć do pełnej strony warsztatów. Dobra baza już jest — formularz, backend, dashboard. Następne kroki to:

- Strona główna z opisem oferty
- System zapisów / rezerwacji
- Blog / porady kawowe

Powodzenia! ☕

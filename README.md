# BalayKo (Ang Imo Sunod nga Balay)

> **Map-First Boarding House Finder Near Schools Throughout Capiz, Philippines**

**BalayKo** is an open, instant web application created for students to find verified boarding houses, dormitories, and rooms located near college campuses throughout the province of Capiz.

No accounts, sign-ups, or logins required — students immediately see an interactive map with verified schools and nearby accommodations.

---

## 🎯 Primary Focus

1. **Find Boarding Houses Near Schools**: Discover accommodations within walking distance (500m to 5km) of college campuses.
2. **Interactive Map-First Experience**: OpenStreetMap & Leaflet with custom price pins, search radius circles, and real walking/driving routes.
3. **Dedicated Focus on CAPSU Pilar**: 1-click shortcut to center on Capiz State University - Pilar Satellite College in Natividad, Pilar, Capiz.
4. **Coverage Across Whole Capiz**: Covers campuses and boarding houses across Roxas City, Pilar, Pontevedra, Panay, Mambusao, Sigma, Dumarao, Tapaz, and all 17 municipalities of Capiz.
5. **No Logins or Accounts**: Zero registration hurdles. Students can immediately explore listings, compare rent and inclusions, calculate travel time, and contact landlords directly via phone or SMS.

---

## 🏫 Capiz Campuses Directory

* **Capiz State University (CAPSU) — Pilar Satellite College** (Pilar, Capiz)
* **CAPSU — Main Campus** (Fuentes Drive, Roxas City)
* **CAPSU — Dayao Campus** (Brgy. Dayao, Roxas City)
* **CAPSU — Pontevedra Campus** (Bailan, Pontevedra)
* **CAPSU — Burias Campus** (Brgy. Burias, Mambusao)
* **CAPSU — Sigma Campus** (Poblacion Sur, Sigma)
* **CAPSU — Dumarao Campus** (Dumarao)
* **CAPSU — Tapaz Campus** (Tapaz)
* **Filamer Christian University (FCU)** (Roxas Avenue, Roxas City)
* **Colegio de la Purisima Concepcion (CPC)** (Arzobispo St., Roxas City)
* **St. Anthony College of Roxas City** (San Roque Ext., Roxas City)
* **Hercor College** (Km. 1, Roxas City)

---

## 🗺️ Key Features

* **Interactive Map Finder**: View campuses marked with collegiate icons and nearby boarding houses with transparent rental prices.
* **Walking & Ride Times**: See estimated walking minutes and tricycle times calculated from the campus gates.
* **Turn-by-Turn Directions**: In-app route guidance with a direct button to open the live destination in the Google Maps app.
* **Side-by-Side Comparison**: Compare up to 3 boarding houses across monthly rent, walking distance, room setup, water/power utilities, curfew, and deposit.
* **Direct Landlord Contact**: Immediate "Call Landlord" (`tel:...`) and "Send SMS" (`sms:...`) actions with verified contact numbers.
* **Bookmarks & Saved Houses**: Save favorite lodgings locally on your device for quick reference without needing an account.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS v4, custom Capiz brand palette
* **Maps & GIS**: Leaflet, OpenStreetMap tiles
* **Icons**: Lucide React
* **Typography**: Plus Jakarta Sans

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to open the map finder.

## Deploying to Render

This project is a frontend application and currently has no backend API routes. The Express server serves the production Vite build and supports client-side page refreshes.

Create a Render **Web Service** for the `main` branch with these settings:

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |

Render supplies the `PORT` environment variable at runtime. Add environment variables only for features that actually need them; do not expose private keys through `VITE_` variables or commit `.env` files.

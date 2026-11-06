# HAKUNA TV – Website

Statische, deutschsprachige Website (HTML5, CSS3, Vanilla JavaScript). Kein Build-Schritt nötig –
kompatibel mit GitHub und Vercel (Static Hosting).

## Lokale Vorschau

```bash
npx serve .            # oder:
python -m http.server 8000
```

Danach im Browser `http://localhost:3000` (serve) bzw. `http://localhost:8000` öffnen.

## Blog

Artikel liegen als statische Seiten unter `blog/` (`blog/<slug>.html`). Neue Artikel:
eine bestehende Artikelseite kopieren, Titel, Beschreibung, Canonical, JSON-LD (BlogPosting,
BreadcrumbList, FAQPage) und Inhalt anpassen, eine Karte in `blog/index.html` ergänzen und die URL
in `sitemap.xml` eintragen. Preise in den Artikeln (Stand November 2026) bei Preisänderungen mitpflegen.

## Vor dem Livegang

- WhatsApp: verifizierte Adresse in `js/script.js` unter `CONFIG.whatsappUrl` eintragen (z. B. `https://wa.me/49…`). Solange der Wert leer ist, führen alle WhatsApp-Schaltflächen zur Support-Seite.
- Rechtstexte (Impressum, Datenschutz, AGB, Haftungsausschluss) rechtlich geprüft ergänzen.
- Unterseiten mit Inhalten füllen (aktuell Platzhalter).

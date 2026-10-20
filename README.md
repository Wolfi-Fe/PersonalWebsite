# Whitewelpe.de

Persönliche Website mit Projekten, Informationen über Pascal und der Erinnerung an Lili. Statische HTML-, CSS- und JavaScript-Dateien; für die Website selbst sind weder Framework noch Build-Schritt erforderlich.

## Lokal ansehen

Mit Node.js 18 oder neuer im Repository ausführen:

```sh
node scripts/preview.mjs
```

Danach http://127.0.0.1:4174 öffnen. Die Vorschau ist ausschließlich lokal erreichbar.

```sh
node scripts/check-site.mjs
node scripts/check-motion.mjs
```

Der erste Check benötigt die laufende Vorschau und prüft die acht Seiten sowie lokale Verweise. Der zweite prüft die Animationsentscheidung mit simulierten Grafikpfaden und Einstellungen.

## Gestaltung und Bedienung

- Eisblau, Violett und dunkles Nachtblau greifen das aktuelle Whitewelpe-Motiv auf.
- Das aktuelle Logo liegt unter `img/logo.webp`; das unveränderte Original liegt unter `img/whitewelpe-logo.jpg`. Die bisherigen Logo-Varianten und die Favicons wurden ebenfalls aktualisiert.
- `favicon.svg`, `favicon.ico`, PNG-Varianten und `apple-touch-icon.png` verwenden dasselbe Motiv. Versionsparameter in den Seiten vermeiden die Weiterverwendung alter Icons aus dem Browsercache.
- Der Schnellzugriff bietet direkte Seitenlinks per Klick oder Strg+K, Pfeiltasten, Enter und Escape. Eine Suchfunktion ist nicht enthalten.
- JARVIS KI wird auf einer kurzen Projektseite mit Entwicklungsstatus vorgestellt.
- Animationen starten automatisch nur bei erkennbarem Hardware-Grafikpfad, ohne reduzierte Bewegung und im sichtbaren Tab. Der Status in der Werkzeugleiste ist zusätzlich ein barrierefrei bedienbarer Schalter: Eine bewusste manuelle Auswahl überschreibt die Automatik für diese Website und wird im Browser gespeichert.
- Die Grafikprüfung speichert und überträgt keine Rendererinformationen; ihr kleiner WebGL-Testkontext wird sofort freigegeben. Die Effekte verwenden CSS-Transformationen und Deckkraft.

## Betrieb

Die Website-Dateien liegen im Repository-Stamm und können vom Server per `git pull` direkt übernommen werden. Die Browserskripte verwenden die übliche `.js`-Endung; eine zusätzliche MIME-Konfiguration oder ein Build ist nicht erforderlich. Bilder und Schriften benötigen keine externen Dienste. E-Mail und GitHub sind gewöhnliche Links.

Ein Git-Push aktualisiert den Quellstand in diesem Repository. Die Veröffentlichung auf einem Webserver erfolgt über dessen separat eingerichteten Ablauf.


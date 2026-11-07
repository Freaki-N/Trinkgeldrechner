# Trinkgeldrechner

Eine vollständig clientseitige, offlinefähige Trinkgeldrechner-PWA. Es werden keine Frameworks, externen Dienste, Server-Backends oder Datenbanken verwendet. Die Berechnungsfunktion gibt zunächst absichtlich `0` zurück.

## Voraussetzungen

- Python 3 (nur für den optionalen lokalen Webserver)
- Ein moderner Browser; zur Installation auf iOS Safari

## Lokal starten

Im Projektverzeichnis ausführen:

```text
python server.py
```

Der Server lauscht standardmäßig auf Port 8000 und gibt die lokale Adresse aus. Am Entwicklungsrechner kann die Anwendung unter `http://127.0.0.1:8000` aufgerufen werden. Andere Geräte im selben WLAN können dieselbe Anwendung über die angezeigte lokale IP-Adresse öffnen.

Alternativ können Host und Port angepasst werden:

```text
python server.py --host 0.0.0.0 --port 8000
```

## HTTPS und iPhone

Für Service Worker und Offline-Betrieb benötigt Safari eine sichere HTTPS-Verbindung. `http://localhost` ist eine Browser-Ausnahme; HTTP über die lokale WLAN-IP-Adresse reicht auf dem iPhone nicht aus.

Mit vorhandenem PEM-Zertifikat und passendem Schlüssel kann der Server HTTPS bereitstellen:

```text
python server.py --host 0.0.0.0 --port 8000 --cert cert.pem --key key.pem
```

Ein selbstsigniertes Zertifikat muss auf dem iPhone gegebenenfalls manuell installiert und unter **Einstellungen → Allgemein → Info → Zertifikatsvertrauenseinstellungen** als vertrauenswürdig aktiviert werden. Verwende für dauerhaft einfache Bereitstellung einen HTTPS-Hostingdienst.

### GitHub Pages als Alternative

Die statischen Projektdateien können in ein GitHub-Repository gepusht und über **Settings → Pages** veröffentlicht werden. GitHub Pages stellt die Seite über HTTPS bereit. Öffne anschließend die veröffentlichte URL auf dem iPhone. Der Service Worker und das Manifest sind relativ zur Projekt-URL eingerichtet, sodass auch eine Veröffentlichung in einem Unterpfad funktioniert.

## Auf dem iPhone installieren

1. Öffne die HTTPS-Adresse in Safari.
2. Warte, bis die Seite geladen wurde und der Service Worker die Dateien gecacht hat.
3. Tippe auf **Teilen → Zum Home-Bildschirm** und bestätige.
4. Starte die App über das neue Home-Bildschirm-Symbol.

## Offline-Funktion testen

Rufe die Seite zunächst online auf und warte, bis sie vollständig geladen ist. Öffne danach die installierte App bei deaktivierter Netzwerkverbindung oder im Flugmodus. HTML, Styles, Skripte und Symbole werden beim Installieren des Service Workers in den lokalen Cache geladen. Bei einer neuen App-Version wird der Cache aktualisiert und der alte App-Cache entfernt.

## Bedienung und gespeicherte Einstellungen

Wähle die Servicebewertung, passe Trinkgeldsätze und Durchschnittspreise an und ändere die Mengen mit **−** und **+**. Der tatsächliche Rechnungsbetrag wird unabhängig von den Kategorien eingegeben.

Trinkgeldsätze und Durchschnittspreise werden dauerhaft im `localStorage` des Browsers gespeichert. Mengen und Gesamtpreis bleiben nur während der aktuellen Sitzung erhalten. Die Werte werden ausschließlich lokal auf dem Gerät abgelegt.

## Eigene Berechnungslogik

Öffne `calculator.js` und ergänze den Funktionskörper von `trinkgeldBerechnen()`. Die Funktion erhält die Bewertung, Trinkgeldsätze, Preise, Mengen und den Gesamtpreis als Eigenschaften eines Objekts. Sie soll ausschließlich den absoluten Trinkgeldbetrag als Zahl zurückgeben und weder DOM noch globale Anwendungsdaten verwenden.

Die übrige App berechnet daraus das relative Trinkgeld und den Gesamtpreis inklusive Trinkgeld. Für einen Gesamtpreis von null wird das relative Trinkgeld als `0 %` angezeigt.

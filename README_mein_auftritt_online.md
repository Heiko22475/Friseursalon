Domain: meinauftrittonline.de

Eingerichtet bei ionos unter

Benutzer: meinauftrittonline.de   #Raphaelio7


Vercel: 

web-design-website

IONOS

Todo: 
Hier mussten wir den A-Record ändern (suche in Chatgpt danach)

Alt: 
Der Service wird deaktiviert
Der neue DNS-Record steht im Konflikt mit dem aktiven Service Default Site. Damit der DNS-Record für die Domain gültig ist, werden die DNS-Records des Services deaktiviert.
Folgende DNS-Records werden deaktiviert
Typ	Hostname	Wert
TXT	_dep_ws_mutex	"ee1baa5abb17772c088f224feeb88407aa540747b52ebc6600ad428fefa50d42_1771272604411"
AAAA	@	2001:8d8:100f:f000:0:0:0:200
A	@	217.160.0.187            <--- alt

Neu für Vercel: 
(Wunsch von Vercel)
1) 
A- Record: 216.198.79.1
2) CNAME (weiterleitung)
DNS-Record hinzufügen
Bei CName steht da: 
Für die Hauptdomain verwenden Sie bitte WEiterleitung. 
WEiterleitungsziel: http://987ce9ff8d441a12.vercel-dns-017.com.    (mit Punkt hinten)
+ "auch für Subdomains einrichten" + HTTP-Weiterleitung
3) Nameserver bei IONOS eintragen: 
ns1.vercel-dns.com
ns2.vercel-dns.com

Dann halt eine Stunde warten, Funktioniert nicht sofort. 

Mail-Weiterleitung bei Vercel einrichten

kontakt@meinauftrittonline.de soll nach heiko.scheffler@gmx.de gehen
Bei Vercel: DNS-Records
Type: MX   Value:  mx00.ionos.de.   TTL: 60

Auf IONOS hebe ich weiterleitungen aktiviert nach heiko.scheffler@gmx.de etc. 



Resend für Mailformular: 
TXT:  
resend._domainkey  p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCnhLVcSfCqT2Mei7y74qlHsiRNPUxlttCNa7Hgs1e7izk02B5QZGsEYwfCCERSj+bWd3IXZw4xc4z6dCqAySmqFpLCfEOR6Mc3nMTW/dmdI/3d8K6npRHPrBPR/dsWS0TdVEiHBOR+EqBH7odxaY5AbzWpw4+UGFLuGYmnVn4c8QIDAQAB
SPF(TXT): 
MX: send zeigt auf: feedback-smtp.eu-west-1.amazonses.com
TXT: send wert: v=spf1 include:amazonses.com ~all



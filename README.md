## Important
    1 - Implanter certificat TLS pour localhost
    2 - .htaccess configuré
    3 - Vérifier les vulnérabilités OWASP
    4 - Vérifier la présence de secret dans le code
    5 - Utiliser SonarQube
    6 - Utiliser Owasp Zap
    7 - Utiliser npm audit
    8 - Faire le pdf

## Secondaire
    1 - Améliorer configuration CORS
    2 - Améliorer la gestion des JWT et l'expiration

Clé ssl : burnedtape

openssl req -x509 -newkey ed25519 -days 3650 -noenc -keyout example.com.key -out example.com.crt -subj "/CN=example.com" -addext "subjectAltName=DNS:example.com,DNS:*.example.com,IP:10.0.0.1"
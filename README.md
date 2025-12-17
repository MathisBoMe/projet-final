## Important
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




Pour la configuration https, j'ai utilisé openssl. J'ai du configurer un fichier openssl.cnf pour configurer le certificat, et j'ai ensuite généré une clé privé et un certificat tls auto signé. Ce certificat n'est pas approuvé par un CA et n'est pas considéré comme sécurisé, mais il permet d'utiliser une connexion https pour du développement local. J'ai ensuite configuré le fichier vite.config.ts pour le frontend, et le fichier server.js pour le backend afin de faire générer les deux serveurs en https, en utilisant le certificat et la clé. Ce setup pourra être réutilisé en déployement. Les sites sont affichés en https, et il est possible de récupérer le certificat tls dans le navigateur.
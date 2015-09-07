openssl genrsa -des3 -out server.key 8192
openssl req -new -key server.key -out server.csr
openssl x509 -req -days 3650 -sha512 -in server.csr -signkey server.key -out server.crt -subj "/CN=localhost/O=Internet Widgits Pty Ltd/S=Some-State/C=AU"
cp server.key server.key.copy
openssl rsa -in server.key.copy -out server.key
rm server.key.copy

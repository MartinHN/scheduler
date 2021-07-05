#!/usr/bin/bash
OUTFOLDER="../../cert/"
# openssl req -x509 -newkey rsa:4096 -keyout ${OUTFOLDER}key.pem -out ${OUTFOLDER}cert.pem -days 365 -nodes

openssl req -x509 -out ${OUTFOLDER}cert.pem -keyout ${OUTFOLDER}key.pem \
    -newkey rsa:2048 -nodes -sha256 \
    -subj '/CN=localhost' -extensions EXT -config <(
        printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth"
    )

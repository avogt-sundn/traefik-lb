FROM curlimages/curl:latest

USER root
WORKDIR /
# Config außerhalb des Volumes ablegen
COPY setup.sh some.json /

RUN chmod ugo+rw /setup.sh

ENTRYPOINT ["/setup.sh"]
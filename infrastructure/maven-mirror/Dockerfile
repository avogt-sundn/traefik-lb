FROM dzikoysk/reposilite:3.5.28


# Config außerhalb des Volumes ablegen
COPY reposilite.cdn /reposilite.cdn

# Custom entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
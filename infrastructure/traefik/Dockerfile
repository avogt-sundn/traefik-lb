# Use the official Traefik image as the base image
FROM traefik:v3

# Set the working directory
WORKDIR /etc/traefik

# Config file makes the certs known
COPY traefik_conf.yml /

# Copy the certificates from the certs folder into the image
#COPY certs/server.crt /etc/traefik/certs/selfsigned.crt
#COPY certs/server.key /etc/traefik/certs/selfsigned.key
COPY generate-selfsigned-cert.sh /etc/traefik/generate-selfsigned-cert.sh
RUN chmod u+x /etc/traefik/generate-selfsigned-cert.sh
RUN cd /etc/traefik/ && ./generate-selfsigned-cert.sh

# Expose ports (if needed for Traefik)
EXPOSE 80
EXPOSE 443

# Command to run Traefik
CMD ["ls -la /etc/traefik/certs","traefik"]
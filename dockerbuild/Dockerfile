# Use the official Traefik image as the base image
FROM traefik:v2.11

# Set the working directory
WORKDIR /etc/traefik

# Config file makes the certs known
COPY traefik_conf.yml /

# Copy the certificates from the certs folder into the image
COPY certs/selfsigned.crt /etc/traefik/certs/selfsigned.crt
COPY certs/selfsigned.key /etc/traefik/certs/selfsigned.key

# Expose ports (if needed for Traefik)
EXPOSE 80
EXPOSE 443

# Command to run Traefik
CMD ["traefik"]
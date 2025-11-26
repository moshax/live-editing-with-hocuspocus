FROM node:18-alpine

WORKDIR /app

# Install Hocuspocus + database extension + Postgres client
RUN npm init -y && \
    npm install @hocuspocus/server@2 @hocuspocus/extension-database@2 pg

# Copy server file
COPY server.mjs .

EXPOSE 1234

CMD ["node", "server.mjs"]


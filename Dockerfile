FROM node:18-alpine


WORKDIR /app

# Install app dependencies

COPY package*.json ./


RUN npm ci --omit=dev


COPY . .


EXPOSE 3000

# Start the application
CMD [ "node", "gateway.js" ]

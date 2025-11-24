FROM node:18-alpine


WORKDIR /app

# Install app dependencies

COPY package*.json ./


RUN npm ci --only=production


COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD [ "node", "gateway.js" ]

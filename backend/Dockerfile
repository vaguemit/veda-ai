FROM node:18-alpine

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy codebase
COPY . .

# Build TypeScript to Javascript
RUN npm run build

# Expose server port
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Run compiled server entry
CMD ["npm", "start"]

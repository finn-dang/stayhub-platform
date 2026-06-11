FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create .env file from environment variables (optional)
RUN touch .env

EXPOSE 3000

CMD ["node", "your-app.js"]
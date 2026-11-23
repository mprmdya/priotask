FROM node:20-alpine

WORKDIR /app

# Salin package.json root dan client
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies root dan client
RUN npm install
RUN cd client && npm install

# Salin seluruh kode
COPY . .

# Build frontend
RUN npm run build

# Port aplikasi
EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

# Jalankan server
CMD ["npm", "start"]

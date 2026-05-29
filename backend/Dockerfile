FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client
RUN npm run db:generate

EXPOSE 3001

CMD ["npm", "start"]

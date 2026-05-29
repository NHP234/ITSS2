FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5174

# Using host 0.0.0.0 to make it accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host"]

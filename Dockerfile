FROM ubuntu:latest
LABEL authors="Kelompok TA-07"

# Install dependencies
RUN apt update && apt upgrade -y
RUN apt install -y nodejs npm openssl

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
COPY . .

RUN npm install
RUN #npm run build

EXPOSE 3000

CMD ["node", "app.js"]
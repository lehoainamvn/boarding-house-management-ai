FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Cài Python và các thư viện cần thiết cho AI
RUN apk add --no-cache \
    python3 \
    py3-pip \
    g++ \
    make \
    musl-dev \
    python3-dev \
    openblas-dev

# Cài đặt các thư viện Python qua pip
RUN pip install --no-cache-dir pandas numpy scikit-learn python-dateutil --break-system-packages

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
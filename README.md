# Ride Sharing App (API)

This is ride sharing app apis in Nodejs

## Environment setup
Create `.env` file on root folder and add following values
```sh
# API server url
HOST_URL="http://localhost:4000"
PORT=4000

# SMTP Server Details
SMTP_HOST=
SMPT_USER=
SMTP_PASS=
SMTP_PORT=2525

# 15 = 15 Minutes
PICKUP_LINK_EXPIRY=15
RIDER_RANGE_KM=1
# Rs
STARTING_PRICE=50
# Kilometer
PRICE_PER_KM=20


# Google OAUTH
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
FRONTEND_HOST_URL="http://localhost:3000"

# Mongodb connection string
MONGO_DB_CONNECTION_STRING=

# JWT Secret
JWT_SECRET=
JWT_EXPIRY="24h"
```
Note: you can take the reference from `.env.example` file

## Run the App
Run the following docker compose command to build and run the app
```sh
docker-compose up -d --build
```
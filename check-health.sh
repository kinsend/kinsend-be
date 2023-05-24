#!/bin/bash

echo "Checking SendGrid connection..."
curl -X GET http://localhost:3131/api/health/send-grid
echo

echo "Checking Stripe connection..."
curl -X GET http://localhost:3131/api/health/stripe
echo

echo "Checking Twilio connection..."
curl -X GET http://localhost:3131/api/health/twilio
echo

echo "Checking MongoDB connection..."
curl -X GET http://localhost:3131/api/health/mongodb
echo

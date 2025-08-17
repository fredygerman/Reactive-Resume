#!/usr/bin/env node

const jwt = require("jsonwebtoken");

// This should match the SERVICE_JWT_SECRET in your .env file
const SERVICE_JWT_SECRET = "service_jwt_secret";

// Generate a service token for testing
const serviceToken = jwt.sign(
  {
    serviceProvider: "my-app",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiry
  },
  SERVICE_JWT_SECRET,
);

console.log("Service Token:");
console.log(serviceToken);
console.log("\nUse this token in the x-service-token header for your requests.");

const crypto = require("crypto");

// Test token
const token =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzZXJ2aWNlUHJvdmlkZXIiOiJteS1hcHAiLCJpYXQiOjE3MjM3MjYxMjYsImV4cCI6MTc4NDcyOTcyNn0.uleFlp_rmmcrQAiBOgThRTEo2ULj_Z2xZ0cuXks5W18";
const secret = "service_jwt_secret";

// Split token
const parts = token.split(".");
const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

console.log("Header:", header);
console.log("Payload:", payload);
console.log("Secret:", secret);

// Verify signature
const data = parts[0] + "." + parts[1];
const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
const providedSignature = parts[2];

console.log("Expected signature:", signature);
console.log("Provided signature:", providedSignature);
console.log("Signatures match:", signature === providedSignature);

// Check expiration
const now = Math.floor(Date.now() / 1000);
console.log("Current timestamp:", now);
console.log("Token expires at:", payload.exp);
console.log("Is expired:", now > payload.exp);

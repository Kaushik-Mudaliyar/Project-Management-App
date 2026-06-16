import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

console.log("Server is connected successfully", process.env.PORT);

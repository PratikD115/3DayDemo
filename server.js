const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const app = require("./app");


app.listen(process.env.PORT, "127.0.0.1", () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});


//to connect with mongoDB atlas

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// const DB = "mongodb://localhost:27017";

mongoose
  .connect(DB)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
  });



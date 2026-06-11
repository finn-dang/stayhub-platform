const mongoose = require("mongoose");

async function connect() {
  try {
    await mongoose.connect(process.env.mongooseUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Successfully connected to the database");
  } catch (error) {
    console.log("Failed to connect to the database");
  }
}

module.exports = { connect };

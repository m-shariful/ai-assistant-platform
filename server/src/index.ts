import "./bootstrap.js";
import "./config/dns.js";

import app from "./app.js";
import { connectToDatabase } from "./config/db.js";

// Connect to MongoDB
const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectToDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();

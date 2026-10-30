import "dotenv/config";
import { connectDB } from "./config/db.js";
import { app } from "./app.js";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET must be configured");
await connectDB();
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Haqdarshak API running on port ${port}`));

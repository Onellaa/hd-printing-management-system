import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import chequeRoutes from "./routes/chequeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import companyProfileRoutes from "./routes/companyProfileRoutes.js";
import { authenticate } from "./middleware/authMiddleware.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

export const app = express();

const allowedOrigins = env.clientUrl
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (!allowedOrigins.length && !env.isProduction) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed."));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ message: "HD Printing API is running." });
});

app.use("/api/auth", authRoutes);

// Every route below this line requires a valid JWT token.
app.use("/api/customers", authenticate, customerRoutes);
app.use("/api/items", authenticate, itemRoutes);
app.use("/api/purchase-orders", authenticate, purchaseOrderRoutes);
app.use("/api/invoices", authenticate, invoiceRoutes);
app.use("/api/payments", authenticate, paymentRoutes);
app.use("/api/cheques", authenticate, chequeRoutes);
app.use("/api/reports", authenticate, reportRoutes);
app.use("/api/settings/company-profile", authenticate, companyProfileRoutes);

app.use(errorHandler);

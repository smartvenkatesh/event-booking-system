import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import eventRoutes from "./routes/eventRoutes.js";

const app = express();

const PORT = 8080;

app.use(cors());
app.use(express.json());

app.use("/events", eventRoutes);

mongoose.connect("mongodb://localhost:27017/event").then(() => {
  console.log("DB Connected");
});

app.listen(PORT, () =>
  console.log(`server is running on http://localhost:${PORT}`)
);

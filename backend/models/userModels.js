import mongoose from "mongoose";

const AppUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, default: "user" },
});


export const AppUser = mongoose.model("AppUser", AppUserSchema);

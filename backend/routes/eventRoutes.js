import express from "express";
import { Events } from "../models/eventmodels.js";
import { decrypt } from "../utils/decrypted.js";
import { User } from "../models/loginModel.js";
import { AppUser } from "../models/userModels.js";
import { generateToken } from "../utils/auth.js";
import { Ticket } from "../models/ticketModels.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import { sendMail } from "../utils/sendMail.js";
import mongoose from "mongoose";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(
  "1084606276074-pi38v19s9al1bblt9jucqhiqokgekatp.apps.googleusercontent.com"
);

const router = express.Router();

const decryptMiddleware = (req, res, next) => {
  try {
    if (req.body.encryptedData) {
      req.body = decrypt(req.body.encryptedData);
    }
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid encrypted payload" });
  }
};

router.post("/google-auth", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "1084606276074-pi38v19s9al1bblt9jucqhiqokgekatp.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();

    let user = await AppUser.findOne({ email: payload.email });

    if (!user) {
      user = new AppUser({
        name: payload.name,
        email: payload.email,
      });
      await user.save();
    }

    const jwtToken = generateToken(user);

    return res.json({
      token: jwtToken,
      userId: user._id,
      role: "user",
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(401).json({ message: "Google authentication failed" });
  }
});

router.post("/register", decryptMiddleware, async (req, res) => {
  try {
    const { name, email, password } = req.body.formData;
    const newAppUser = {
      name,
      email,
      password,
    };
    const saved = await AppUser.create(newAppUser);
    return res.status(200).send(saved);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

router.post(
  "/home",
  authenticate,
  authorize("admin", "user"),
  decryptMiddleware,
  async (req, res) => {
    try {
      const {
        eventName,
        eventType,
        eventPlace,
        eventOwner,
        phoneNo,
        address,
        startDate,
        endDate,
      } = req.body.data;
      const newEvent = {
        eventName,
        eventType,
        eventPlace,
        eventOwner,
        phoneNo,
        address,
        startDate,
        endDate,
      };
      const eventCreate = await Events.create(newEvent);
      return res
        .status(200)
        .json({ eventCreate, message: "waiting for verification by admin" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: err.message });
    }
  }
);

router.get(
  "/home",
  authenticate,
  authorize("admin", "user"),
  async (req, res) => {
    try {
      const getEvents = await Events.find({});
      return res.status(200).json(getEvents);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: err.message });
    }
  }
);

router.get(
  "/home/:id",
  authenticate,
  authorize("admin", "user"),
  async (req, res) => {
    try {
      const getEvents = await Events.findById(req.params.id);
      return res.status(200).json(getEvents);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: err.message });
    }
  }
);

router.put(
  "/home/verify/:id",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      const updatedEvent = await Events.findByIdAndUpdate(
        req.params.id,
        { isVerified: true },
        { new: true }
      );

      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found." });
      }

      res.status(200).json(updatedEvent);
    } catch (err) {
      console.error("Verification error:", err);
      res.status(500).json({ message: "Failed to verify event." });
    }
  }
);

router.post(
  "/home/apply/:id",
  authenticate,
  authorize("admin", "user"),
  async (req, res) => {
    const { userId, seatNumber } = req.body;

    const event = await Events.findById(req.params.id);

    if (!event || !event.isVerified) {
      return res
        .status(403)
        .json({ message: "Event not verified or doesn't exist." });
    }

    if (event.seatsAvailable <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    event.seatsAvailable -= seatNumber;
    await event.save();

    const newTicket = new Ticket({
      userId,
      eventId: req.params.id,
      seatNumber,
    });
    await newTicket.save();

    res.status(200).json({ message: "Ticket applied successfully" });
  }
);

router.post(
  "/tickets/cancel/:userId",
  authenticate,
  authorize("user", "admin"),
  async (req, res) => {
    try {
      const { ticketId } = req.body;

      const ticket = await Ticket.findOne({
        _id: ticketId,
        userId: req.params.userId,
      });

      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const event = await Events.findById(ticket.eventId);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      event.seatsAvailable += ticket.seatNumber;
      await event.save();

      await Ticket.findByIdAndDelete(ticket._id);

      return res.status(200).json({ message: "Ticket cancelled successfully" });
    } catch (error) {
      console.error("Cancel ticket error:", error);
      res.status(500).json({ message: "Server error during cancellation" });
    }
  }
);

router.get("/tickets/summary/:userId/", async (req, res) => {
  try {
    const tickets = await Ticket.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.params.userId) } },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      {
        $unwind: "$eventDetails",
      },
      {
        $project: {
          _id: 1,
          eventId: "$eventDetails._id",
          eventName: "$eventDetails.eventName",
          eventPlace: "$eventDetails.eventPlace",
          startDate: "$eventDetails.startDate",
          seatNumber: 1,
        },
      },
    ]);

    res.status(200).json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/tickets/:userId", async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.params.userId }).populate(
      "eventId"
    );
    res.status(200).json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

router.get("/register/user/:id", async (req, res) => {
  try {
    const appUser = await AppUser.findById(req.params.id);
    if (!appUser) return res.status(404).json({ message: "Not found" });
    res.json(appUser);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", decryptMiddleware, async (req, res) => {
  const { email, password } = req.body.form;

  try {
    let user = await User.findOne({ email });

    if (user) {
      if (user.password !== password) {
        return res
          .status(401)
          .json({ success: false, message: "Incorrect password" });
      }
      console.log("user", user);

      const token = generateToken(user);

      console.log("token", token);

      return res.json({
        success: true,
        message: "Admin login successful",
        token,
        userId: user._id,
        role: user.role,
        name: user.name,
      });
    }

    let appUser = await AppUser.findOne({ email: email });
    if (appUser) {
      if (appUser.password !== password) {
        return res
          .status(401)
          .json({ success: false, message: "Incorrect password" });
      }

      const token = generateToken(appUser);

      return res.json({
        success: true,
        message: "AppUser login successful",
        token,
        userId: appUser._id,
        name: appUser.name,
        role: "user",
      });
    }

    return res.status(404).json({ success: false, message: "User not found" });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/login/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user =
      (await User.findOne({ email })) || (await AppUser.findOne({ email }));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //  You can use a reset token mechanism instead of plain password reset in production
    const resetLink = `http://localhost:3000/reset-password/${user._id}`;

    const emailSent = await sendMail(
      user.email,
      "Password Reset Request",
      `Click here to reset your password: ${resetLink}`
    );

    if (emailSent) {
      res.status(200).json({ message: "Reset email sent" });
    } else {
      res.status(500).json({ message: "Failed to send reset email" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password/:id", async (req, res) => {
  const { password } = req.body;
  const { id } = req.params;

  try {
    const user = (await User.findById(id)) || (await AppUser.findById(id));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = password;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get(
  "/home/:id",
  authenticate,
  authorize("admin", "user"),
  async (req, res) => {
    const { id } = req.params;
    try {
      const getEvents = await Events.findById(id);
      return res.status(200).json(getEvents);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: err.message });
    }
  }
);

router.put(
  "/home/:id",
  authenticate,
  authorize("admin"),
  decryptMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateEvents = await Events.findByIdAndUpdate(id, req.body.data);
      if (!updateEvents) {
        return res.status(404).json({ message: "Event Not Found" });
      }
      return res.status(200).send({ message: "Event Updated Successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  }
);

router.delete("/home/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteEvent = await Events.findByIdAndDelete(id);
    if (!deleteEvent) {
      return res.status(404).json({ message: "Event Not Found" });
    }
    return res.status(200).json({ message: "Event Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

router.get(
  "/home/:id",
  authenticate,
  authorize("admin", "user"),
  async (req, res) => {
    const { id } = req.params;
    try {
      const getEvents = await Events.findById(id);
      return res.status(200).json(getEvents);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: err.message });
    }
  }
);

export default router;

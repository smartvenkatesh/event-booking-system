import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppUser', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Events', required: true },
  seatNumber: { type: Number ,default: 10},
  createdAt: { type: Date, default: Date.now }
});

export const Ticket = mongoose.model('Ticket', ticketSchema);

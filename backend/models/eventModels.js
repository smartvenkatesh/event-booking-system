import mongoose from "mongoose";

const EventSchema=new mongoose.Schema({
    eventName:{type:String,required:true},
    eventType:{type:String,required:true},
    eventPlace:{type:String,required:true},
    eventOwner:{type:String,required:true},
    phoneNo:{type:Number,required:true},
    address:{type:String,required:true},
    startDate:{type:Date,required:true},
    endDate:{type:Date,required:true},
    seatsAvailable: {type: Number,default: 10},
    isVerified: { type: Boolean, default: false },
},{
    timestamps:true,
})

export const Events=mongoose.model("Events",EventSchema)
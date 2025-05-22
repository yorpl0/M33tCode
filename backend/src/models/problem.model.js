import mongoose from "mongoose";
const problemSchema= new mongoose.Schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    difficulty:{type:String,enum: ["Easy", "Medium", "Hard"], required: true},
    tags:[{type:String}],
    examples:[{
        input:{type:String},
        output:{type:String},
        explanation:{type:String}
    }],
    constraint:[{type:String}],
    testCases: [
    {
      input: {
        type: String,
        required: true,
      },
      expectedOutput: {
        type: String,
        required: true,
      },
      isHidden: {
        type: Boolean,
        default: true, 
      },
    }
  ],
  timeLimit: {
    type: Number,
    required: true,
    default: 1, // Common default, adjust as needed
    min: 0.1, // Minimum time limit
  },
  memoryLimit: {
    type: Number,
    required: true,
    default: 2048, // Common default, adjust as needed
    min: 2048, // Minimum memory limit
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
const Problem = mongoose.model("Problem",problemSchema);
export default Problem;

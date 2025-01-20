const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    active:{
      type:Boolean,
      require:false,
      default:true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);

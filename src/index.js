const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productsRoutes");
const orderRouter = require("./routes/ordersRoutes");
const serviceRouter = require("./routes/serviceRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const path = require("path");

const app = express();

app.use(cors());

app.use(express.json());
app.use("/api/uploads", express.static(path.join(__dirname, "../uploads")));

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.on("connected", () => console.log("Connected to MongoDB"));
mongoose.connection.on("error", (err) =>
  console.error("MongoDB connection error:", err)
);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/service", serviceRouter);
app.use("/api/category", categoryRouter);
app.get("/", (req, res) => {
  res.json(
    "Hello World! Server is running and we are getting the data from the backend."
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

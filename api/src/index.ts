import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import { connectMongo } from "./db/connectMongo";

import { userRouter } from "./routes/user.route";
import { categoryRouter } from "./routes/category.route";
import { productRouter } from "./routes/product.route";
import { orderRouter } from "./routes/order.route";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cookieParser());

app.use(bodyParser.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json());

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://papelaria-mern.vercel.app",
  ],
  credentials: true,
};
app.use(cors(corsOptions));

app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);
app.use("/admin/categories", categoryRouter);
app.use("/admin/products", productRouter);

app.listen(PORT, () => {
  connectMongo();
  console.log("Servidor rodando na porta", PORT);
});

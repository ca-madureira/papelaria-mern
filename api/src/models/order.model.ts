import mongoose, { Document, Model } from "mongoose";

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Schema.Types.ObjectId;
  cartItems: { product: mongoose.Schema.Types.ObjectId; quantity: number }[];
  totalAmount: number;
  status: "pendente" | "pago";
}

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pendente", "pago"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre<IOrder>("save", async function (next) {
  if (!this.orderNumber) {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const lastOrderNumber = lastOrder ? parseInt(lastOrder.orderNumber, 10) : 0;
    const newOrderNumber = (lastOrderNumber + 1).toString().padStart(6, "0"); // Exemplo de número com 6 dígitos
    this.orderNumber = newOrderNumber;
  }
  next();
});

export const Order: Model<IOrder> = mongoose.model<IOrder>(
  "Order",
  orderSchema
);

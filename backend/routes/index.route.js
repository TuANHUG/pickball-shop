import userRouter from "./userRoute.js";
import productRouter from "./productRoute.js";
import adminRouter from "./adminRoute.js";
import cartRoute from "./cartRoute.js";
import orderRoute from "./orderRoute.js";
import tagRouter from "./tagRoute.js";
import tagGroupRouter from "./tagGroupRoute.js";
const route = (app) => {
    app.use("/api/user", userRouter);
    app.use("/api/product", productRouter);
    app.use("/api/admin", adminRouter);
    app.use("/api/cart/", cartRoute);
    app.use("/api/order", orderRoute);
    app.use("/api/tag", tagRouter);
    app.use("/api/tag-group", tagGroupRouter);
};

export default route;


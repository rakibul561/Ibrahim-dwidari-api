import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import router from "./app/routes";

const app: Application = express();

// app.use(
//     cors({
//         origin: [
//             "http://localhost:3000",
//             "http://localhost:3001",
//             "http://localhost:5173",
//             "https://ibrahim-cyan.vercel.app"
//         ],
//         credentials: true,
//     })
// );

app.use(cors({

    origin: true,

    credentials: true,

}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Welcome to restaurant API",
    });
});

app.use("/api/v1", router);

app.use(globalErrorHandler);
app.use(notFound);


export default app;

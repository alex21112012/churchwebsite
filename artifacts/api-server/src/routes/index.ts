import { Router, type IRouter } from "express";
import healthRouter from "./health";
import churchRouter from "./church";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/church", churchRouter);

export default router;

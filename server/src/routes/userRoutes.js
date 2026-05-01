import { Router } from "express";
import auth from "../middleware/auth.js";
import { me, searchUsers, updateUsername } from "../controllers/userController.js";

const router = Router();

router.use(auth);
router.get("/me", me);
router.put("/username", updateUsername);
router.get("/search", searchUsers);

export default router;

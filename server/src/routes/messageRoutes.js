import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  getConversations,
  getMessagesWithUser,
  sendMessage,
} from "../controllers/messageController.js";

const router = Router();

router.use(auth);
router.get("/conversations", getConversations);
router.get("/:userId", getMessagesWithUser);
router.post("/:userId", sendMessage);

export default router;

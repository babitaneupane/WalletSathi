import { Router } from "express";
import { getGroups, createGroup, joinGroup, deleteGroup, getGroupById } from "../controllers/group.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.route("/")
    .get(getGroups)
    .post(createGroup);

router.post("/join", joinGroup);
router.route("/:id")
    .get(getGroupById)
    .delete(deleteGroup);

export default router;
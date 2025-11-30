import express from "express";
import {
  createTagGroup,
  getAllTagGroups,
  getTagGroupById,
  updateTagGroup,
  deleteTagGroup,
} from "../controllers/tagGroupController.js";

const tagGroupRouter = express.Router();

tagGroupRouter.post("/", createTagGroup);

tagGroupRouter.get("/", getAllTagGroups);

tagGroupRouter.get("/:id", getTagGroupById);

tagGroupRouter.put("/:id", updateTagGroup);

tagGroupRouter.delete("/:id", deleteTagGroup);

export default tagGroupRouter;

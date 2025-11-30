import express from "express";
import {
  createTag,
  getAllTags,
  getTagsGrouped,
  getTagById,
  updateTag,
  deleteTag,
} from "../controllers/tagController.js";

const tagRouter = express.Router();

tagRouter.post("/", createTag);

tagRouter.get("/", getAllTags);

tagRouter.get("/tag-by-group", getTagsGrouped);

tagRouter.get("/:id", getTagById);

tagRouter.put("/:id", updateTag);

tagRouter.delete("/:id", deleteTag);

export default tagRouter;

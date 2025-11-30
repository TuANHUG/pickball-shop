import mongoose from "mongoose";
import slug from "mongoose-slug-updater";

mongoose.plugin(slug);
const TagGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, slug: "name", unique: true },
    description: String,
  },
  { minimize: false, timestamps: true }
);

const TagGroup = mongoose.models.TagGroup || mongoose.model("TagGroup", TagGroupSchema);

export default TagGroup;

import mongoose from "mongoose";
import slug from "mongoose-slug-updater";

mongoose.plugin(slug);
const TagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, slug: "name", unique: true },
    tag_group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TagGroup",
      required: true,
    },
    description: String,
  },
  { minimize: false, timestamps: true }
);

const Tag = mongoose.models.Tag || mongoose.model("Tag", TagSchema);

export default Tag;

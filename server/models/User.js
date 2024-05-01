import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    picture: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    watchedVideos: {
      type: [
        {
          type: new mongoose.Schema(
            {
              videoId: { type: mongoose.Types.ObjectId, unique: true },
            },
            { timestamps: true },
          ),
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
)

export default mongoose.model('User', UserSchema)

import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import Video from '../models/Video.js'
import mongoose from 'mongoose'

export const googleAuth = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
      if (user.role === 'user') {
        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT,
        )

        const subscribedUsers = await User.aggregate([
          { $match: { email: req.body.email } },
          {
            $unwind: '$subscribedUsers',
          },
          { $addFields: { userObjectId: { $toObjectId: '$subscribedUsers' } } },
          {
            $lookup: {
              from: 'users',
              localField: 'userObjectId',
              foreignField: '_id',
              as: 'userInfo',
            },
          },
          {
            $project: {
              userInfo: 1,
            },
          },
          {
            $unwind: '$userInfo',
          },
          { $replaceRoot: { newRoot: '$userInfo' } },
          {
            $project: {
              name: 1,
              picture: 1,
            },
          },
        ])

        res.status(200).json({ result: user, subscribedUsers, token })
      } else {
        res.status(200).json({ message: user.role })
      }
    } else {
      const newUser = new User({
        ...req.body,
      })
      const savedUser = await newUser.save()
      const token = jwt.sign(
        { id: savedUser._id, role: savedUser.role },
        process.env.JWT,
      )
      res.status(200).json({ result: savedUser, token })
    }
  } catch (err) {
    next(err)
  }
}

export const getUser = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.userId)
  try {
    const user = await User.aggregate([
      {
        $match: { _id: userId },
      },
      {
        $project: {
          name: 1,
          picture: 1,
          subscribers: {
            $cond: {
              if: { $isArray: '$subscribers' },
              then: { $size: '$subscribers' },
              else: 0,
            },
          },
        },
      },
    ])

    res.status(200).json(user)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const like = async (req, res) => {
  const videoId = req.params.videoId
  const userId = req.userId

  try {
    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { likes: userId },
      $pull: { dislikes: userId },
    })
    await User.findByIdAndUpdate(userId, {
      $push: {
        likedVideos: { videoId },
      },
    })
    res.status(200).json({ message: 'Liked' })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const unlike = async (req, res) => {
  const videoId = req.params.videoId
  const userId = req.userId

  try {
    await Video.findByIdAndUpdate(videoId, {
      $pull: { likes: userId },
    })
    await User.findByIdAndUpdate(userId, {
      $pull: {
        likedVideos: { videoId },
      },
    })
    res.status(200).json({ message: 'Unliked' })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const dislike = async (req, res) => {
  const videoId = req.params.videoId
  const userId = req.userId

  try {
    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { dislikes: userId },
      $pull: { likes: userId },
    })
    await User.findByIdAndUpdate(userId, {
      $pull: {
        likedVideos: { videoId },
      },
    })
    res.status(200).json({ message: 'Disliked' })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const undislike = async (req, res) => {
  const videoId = req.params.videoId
  const userId = req.userId

  try {
    await Video.findByIdAndUpdate(videoId, {
      $pull: { dislikes: userId },
    })
    res.status(200).json({ message: 'Undisliked' })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const sub = async (req, res, next) => {
  const userId = req.userId
  const channelId = req.params.channelId
  const objectUserId = mongoose.Types.ObjectId(req.userId)

  try {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { subscribedUsers: channelId },
    })
    await User.findByIdAndUpdate(channelId, {
      $addToSet: { subscribers: userId },
    })

    const updatedUser = await User.findById(userId)

    const subscribedUsers = await User.aggregate([
      { $match: { _id: objectUserId } },
      {
        $unwind: '$subscribedUsers',
      },
      { $addFields: { userObjectId: { $toObjectId: '$subscribedUsers' } } },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $project: {
          userInfo: 1,
        },
      },
      {
        $unwind: '$userInfo',
      },
      { $replaceRoot: { newRoot: '$userInfo' } },
      {
        $project: {
          name: 1,
          picture: 1,
        },
      },
    ])

    res.status(200).json({ updatedUser, subscribedUsers })
  } catch (err) {
    next(err)
  }
}

export const unsub = async (req, res, next) => {
  const userId = req.userId
  const channelId = req.params.channelId
  const objectUserId = mongoose.Types.ObjectId(req.userId)

  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { subscribedUsers: channelId },
    })
    await User.findByIdAndUpdate(channelId, {
      $pull: { subscribers: userId },
    })

    const updatedUser = await User.findById(userId)

    const subscribedUsers = await User.aggregate([
      { $match: { _id: objectUserId } },
      {
        $unwind: '$subscribedUsers',
      },
      { $addFields: { userObjectId: { $toObjectId: '$subscribedUsers' } } },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $project: {
          userInfo: 1,
        },
      },
      {
        $unwind: '$userInfo',
      },
      { $replaceRoot: { newRoot: '$userInfo' } },
      {
        $project: {
          name: 1,
          picture: 1,
        },
      },
    ])

    res.status(200).json({ updatedUser, subscribedUsers })
  } catch (err) {
    next(err)
  }
}

export const addWatchedVideo = async (req, res, next) => {
  const userId = mongoose.Types.ObjectId(req.userId)
  const { videoId } = req.params

  try {
    const exist = await User.aggregate([
      {
        $match: { _id: userId },
      },
      {
        $unwind: '$watchedVideos',
      },
      { $replaceRoot: { newRoot: '$watchedVideos' } },
      {
        $match: { videoId },
      },
    ])
    if (exist.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $pull: {
          watchedVideos: { videoId },
        },
      })
      await User.findByIdAndUpdate(userId, {
        $addToSet: {
          watchedVideos: { videoId },
        },
      })
    } else {
      await User.findByIdAndUpdate(userId, {
        $addToSet: {
          watchedVideos: { videoId },
        },
      })
    }
    res.status(200).json({ data: exist })
  } catch (err) {
    next(err)
  }
}

export const getLiked = async (req, res, next) => {
  const userId = mongoose.Types.ObjectId(req.userId)
  const { page } = req.query

  try {
    const startIndex = (Number(page) - 1) * 20
    const total = await User.aggregate([
      {
        $match: { _id: userId },
      },
      {
        $unwind: '$likedVideos',
      },
      { $replaceRoot: { newRoot: '$likedVideos' } },
      {
        $sort: { updatedAt: -1 },
      },
      { $addFields: { videoObjectId: { $toObjectId: '$videoId' } } },
      {
        $lookup: {
          from: 'videos',
          localField: 'videoObjectId',
          foreignField: '_id',
          as: 'liked',
        },
      },
      {
        $unwind: '$liked',
      },
      { $replaceRoot: { newRoot: '$liked' } },
      {
        $count: 'count',
      },
    ])

    const likedVideos = await User.aggregate([
      {
        $match: { _id: userId },
      },
      {
        $unwind: '$likedVideos',
      },
      { $replaceRoot: { newRoot: '$likedVideos' } },
      {
        $sort: { updatedAt: -1 },
      },
      { $addFields: { videoObjectId: { $toObjectId: '$videoId' } } },
      {
        $lookup: {
          from: 'videos',
          localField: 'videoObjectId',
          foreignField: '_id',
          as: 'liked',
        },
      },
      {
        $unwind: '$liked',
      },
      { $replaceRoot: { newRoot: '$liked' } },
      {
        $project: {
          status: 0,
          videoPath: 0,
          videoUrl: 0,
          likes: 0,
          __v: 0,
          dislikes: 0,
        },
      },
      { $skip: startIndex },
      { $limit: 20 },
      { $addFields: { userObjectId: { $toObjectId: '$userId' } } },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
      {
        $project: {
          'userInfo.createdAt': 0,
          'userInfo.email': 0,
          'userInfo.likedVideos': 0,
          'userInfo.subscribedUsers': 0,
          'userInfo.updatedAt': 0,
          'userInfo.watchedVideos': 0,
          'userInfo.__v': 0,
          'userInfo.subscribers': 0,
        },
      },
    ])

    res.status(200).json({
      data: likedVideos,
      numberOfPages: Math.ceil(total?.count ? total[0].count / 20 : 1),
      total: total?.count ? total[0].count : 0,
    })
  } catch (err) {
    next(err)
  }
}

export const getWatched = async (req, res, next) => {
  const userId = mongoose.Types.ObjectId(req.userId)
  const { page } = req.query

  try {
    const startIndex = (Number(page) - 1) * 20
    const total = await User.aggregate([
      {
        $match: { _id: userId },
      },
      {
        $unwind: '$watchedVideos',
      },
      { $replaceRoot: { newRoot: '$watchedVideos' } },
      {
        $sort: { updatedAt: -1 },
      },
      { $addFields: { videoObjectId: { $toObjectId: '$videoId' } } },
      {
        $lookup: {
          from: 'videos',
          localField: 'videoObjectId',
          foreignField: '_id',
          as: 'watched',
        },
      },
      {
        $unwind: '$watched',
      },
      { $replaceRoot: { newRoot: '$watched' } },
      {
        $count: 'count',
      },
    ])

    const watchedVideos = await User.aggregate([
      {
        $match: { _id: userId },
      },
      {
        $unwind: '$watchedVideos',
      },
      { $replaceRoot: { newRoot: '$watchedVideos' } },
      {
        $sort: { updatedAt: -1 },
      },
      { $addFields: { videoObjectId: { $toObjectId: '$videoId' } } },
      {
        $lookup: {
          from: 'videos',
          localField: 'videoObjectId',
          foreignField: '_id',
          as: 'watched',
        },
      },
      {
        $unwind: '$watched',
      },
      { $replaceRoot: { newRoot: '$watched' } },
      {
        $project: {
          status: 0,
          videoPath: 0,
          videoUrl: 0,
          likes: 0,
          __v: 0,
          dislikes: 0,
        },
      },
      { $skip: startIndex },
      { $limit: 20 },
      { $addFields: { userObjectId: { $toObjectId: '$userId' } } },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
      {
        $project: {
          'userInfo.createdAt': 0,
          'userInfo.email': 0,
          'userInfo.likedVideos': 0,
          'userInfo.subscribedUsers': 0,
          'userInfo.updatedAt': 0,
          'userInfo.watchedVideos': 0,
          'userInfo.__v': 0,
          'userInfo.subscribers': 0,
        },
      },
    ])
    res.status(200).json({
      data: watchedVideos,
      numberOfPages: Math.ceil(total?.count ? total[0].count / 20 : 1),
      total: total?.count ? total[0].count : 0,
    })
  } catch (err) {
    next(err)
  }
}

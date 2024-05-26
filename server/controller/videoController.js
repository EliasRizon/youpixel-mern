import Video from '../models/Video.js'
import Comment from '../models/Comment.js'
import User from '../models/User.js'
import mongoose from 'mongoose'

export const addVideo = async (req, res, next) => {
  const userObjectId = mongoose.Types.ObjectId(req.userId)

  const video = new Video({ userId: userObjectId, ...req.body })

  try {
    video.save()
    res.status(200).json({ data: video })
  } catch (error) {
    res.status(500).send({ message: error })
  }
}

export const editVideo = async (req, res, next) => {
  const videoObjectId = mongoose.Types.ObjectId(req.params.videoId)
  const userObjectId = mongoose.Types.ObjectId(req.userId)

  try {
    const video = await Video.findById(videoObjectId)

    if (userObjectId.equals(video.userId)) {
      await Video.findByIdAndUpdate(videoObjectId, {
        ...req.body,
      })
      res.status(200).json({ message: 'Edit successfully' })
    } else {
      res.status(403).json({ message: 'You can only edit your video!' })
    }
  } catch (error) {
    res.status(500).send({ message: error })
  }
}

export const ApproveVideo = async (req, res, next) => {
  const videoObjectId = mongoose.Types.ObjectId(req.params.videoId)
  const requestRole = req.role
  try {
    if (requestRole != 'admin') {
      res.status(401).json({ message: 'Unauthorized' })
    } else {
      await Video.findByIdAndUpdate(videoObjectId, {
        status: 'approved',
      })

      res.status(200).json({ message: 'Edit successfully' })
    }
  } catch (error) {
    res.status(500).send({ message: error })
  }
}

export const DenyVideo = async (req, res, next) => {
  const videoObjectId = mongoose.Types.ObjectId(req.params.videoId)
  const requestRole = req.role
  try {
    if (requestRole != 'admin') {
      res.status(401).json({ message: 'Unauthorized' })
    } else {
      await Video.findByIdAndUpdate(videoObjectId, {
        status: 'denided',
      })

      res.status(200).json({ message: 'Edit successfully' })
    }
  } catch (error) {
    res.status(500).send({ message: error })
  }
}

export const deleteVideo = async (req, res, next) => {
  const { videoId } = req.params
  const userObjectId = mongoose.Types.ObjectId(req.userId)
  const requestRole = req?.role

  try {
    const video = await Video.findById(videoId)
    if (userObjectId.equals(video.userId) || requestRole === 'admin') {
      await Video.findByIdAndDelete(videoId)
      await Comment.deleteMany({
        videoId: videoId,
      })
      await User.updateMany(
        {},
        {
          $pull: {
            watchedVideos: {
              videoId: videoId,
            },
          },
        },
      )
      res.status(200).json({ message: 'Delete successfully' })
    } else {
      res.status(403).json({ message: 'You can only delete your video!' })
    }
  } catch (error) {
    res.status(500).send({ message: error })
  }
}

export const fetchVideos = async (req, res) => {
  try {
    const videos = await Video.aggregate([
      { $match: { status: 'approved' } },
      { $sample: { size: 500 } },
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
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
      {
        $project: {
          'userInfo.watchedVideos': 0,
        },
      },
    ])

    res.status(200).json({ data: videos })
  } catch (error) {
    res.status(500).json({ message: error })
  }
}

export const getVideo = async (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id)

  try {
    const video = await Video.aggregate([
      {
        $match: {
          _id: id,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
      {
        $project: {
          'userInfo.watchedVideos': 0,
        },
      },
    ])

    res.status(200).json({ data: video[0] })
  } catch (error) {
    res.status(500).json({ message: error })
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
      {
        $lookup: {
          from: 'videos',
          localField: 'videoId',
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
      {
        $lookup: {
          from: 'videos',
          localField: 'videoId',
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
          'userInfo.updatedAt': 0,
          'userInfo.watchedVideos': 0,
          'userInfo.__v': 0,
        },
      },
    ])
    res.status(200).json({
      data: watchedVideos,
      numberOfPages: Math.ceil(total[0]?.count ? total[0].count / 20 : 1),
      total: total[0]?.count ? total[0].count : 0,
    })
  } catch (err) {
    res.status(500).json({ message: err })
  }
}

export const addWatchedVideo = async (req, res, next) => {
  const userId = mongoose.Types.ObjectId(req.userId)
  const videoObjectId = mongoose.Types.ObjectId(req.params.videoId)

  try {
    await User.findByIdAndUpdate(userId, {
      $pull: {
        watchedVideos: { videoId: videoObjectId },
      },
    })
    await User.findByIdAndUpdate(userId, {
      $addToSet: {
        watchedVideos: { videoId: videoObjectId },
      },
    })
    res.status(200).json({ message: 'Add successfully' })
  } catch (err) {
    res.status(500).json({ message: err })
  }
}

export const addView = async (req, res) => {
  const { id } = req.params

  try {
    await Video.findByIdAndUpdate(id, {
      $inc: { views: 1 },
    })
    res.status(200).json({ message: 'Added' })
  } catch (error) {
    res.status(500).json({ message: error })
  }
}

export const getTopView = async (req, res) => {
  const { page } = req.query

  try {
    const startIndex = (Number(page) - 1) * 20
    const total = await Video.find({ status: 'approved' }).countDocuments({})

    const videos = await Video.aggregate([
      { $match: { status: 'approved' } },
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
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
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
      { $sort: { views: -1 } },
      { $skip: startIndex },
      { $limit: 20 },
    ])

    res
      .status(200)
      .json({ data: videos, numberOfPages: Math.ceil(total / 20), total })
  } catch (error) {
    res.status(500).json({ message: error })
  }
}

export const getUserVideos = async (req, res) => {
  const userObjectId = mongoose.Types.ObjectId(req.query.id)
  const { page } = req.query

  try {
    const startIndex = (Number(page) - 1) * 20
    const total = await Video.find({
      userId: userObjectId,
      status: 'approved',
    }).countDocuments({})

    const videos = await Video.aggregate([
      { $match: { userId: userObjectId, status: 'approved' } },
      {
        $project: {
          __v: 0,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
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
          'userInfo.updatedAt': 0,
          'userInfo.watchedVideos': 0,
          'userInfo.__v': 0,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: startIndex },
      { $limit: 20 },
    ])

    res
      .status(200)
      .json({ data: videos, numberOfPages: Math.ceil(total / 20), total })
  } catch (error) {
    res.status(404).json({ message: error })
  }
}

export const getUserVideosPending = async (req, res) => {
  const { id, page } = req.query

  try {
    const startIndex = (Number(page) - 1) * 20
    const total = await Video.find({
      userId: id,
      status: ['pending', 'denied'],
    }).countDocuments({})

    const videos = await Video.find({
      userId: id,
      status: ['pending', 'denied'],
    })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(20)

    res
      .status(200)
      .json({ data: videos, numberOfPages: Math.ceil(total / 20), total })
  } catch (error) {
    res.status(404).json({ message: error })
  }
}

export const getVideosBySearch = async (req, res, next) => {
  const { search_query, page } = req.query

  try {
    const startIndex = (Number(page) - 1) * 20
    const total = await Video.aggregate([
      {
        $search: {
          index: 'videos-full-text-search',
          text: {
            query: `${search_query}`,
            path: {
              wildcard: '*',
            },
          },
        },
      },
      {
        $match: {
          status: 'approved',
        },
      },
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
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
      {
        $project: {
          'userInfo.watchedVideos': 0,
        },
      },
      {
        $count: 'count',
      },
    ])

    const result = await Video.aggregate([
      {
        $search: {
          index: 'videos-full-text-search',
          text: {
            query: `${search_query}`,
            path: {
              wildcard: '*',
            },
          },
        },
      },
      {
        $match: {
          status: 'approved',
        },
      },
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
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
      {
        $project: {
          'userInfo.watchedVideos': 0,
        },
      },
      { $skip: startIndex },
      { $limit: 20 },
    ])

    res.status(200).json({
      data: result,
      numberOfPages: Math.ceil(total[0]?.count / 20),
      total: total[0]?.count ? total[0].count : 0,
    })
  } catch (error) {
    res.status(500).send({ message: error })
  }
}

export const getPendingVideosBySearch = async (req, res, next) => {
  const { search_query, page } = req.query

  try {
    const startIndex = (Number(page) - 1) * 20
    const total = await Video.find({
      title: { $regex: search_query, $options: 'i' },
      status: 'pending',
    }).countDocuments({})

    const result = await Video.aggregate([
      {
        $match: {
          title: { $regex: search_query, $options: 'i' },
          status: 'pending',
        },
      },
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
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
      {
        $project: {
          'userInfo.watchedVideos': 0,
        },
      },
      { $skip: startIndex },
      { $limit: 20 },
    ])

    res
      .status(200)
      .json({ data: result, numberOfPages: Math.ceil(total / 20), total })
  } catch (error) {
    res.status(500).send({ message: error })
  }
}

export const getDenidedVideosBySearch = async (req, res, next) => {
  const { search_query, page } = req.query

  try {
    const startIndex = (Number(page) - 1) * 20
    const total = await Video.find({
      title: { $regex: search_query, $options: 'i' },
      status: 'denided',
    }).countDocuments({})

    const result = await Video.aggregate([
      {
        $match: {
          title: { $regex: search_query, $options: 'i' },
          status: 'denided',
        },
      },
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
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $unwind: '$userInfo',
      },
      {
        $project: {
          'userInfo.watchedVideos': 0,
        },
      },
      { $skip: startIndex },
      { $limit: 20 },
    ])

    res
      .status(200)
      .json({ data: result, numberOfPages: Math.ceil(total / 20), total })
  } catch (error) {
    res.status(500).send({ message: error })
  }
}

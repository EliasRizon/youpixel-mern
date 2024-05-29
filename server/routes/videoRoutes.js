import express from 'express'
import {
  ApproveVideo,
  DenyVideo,
  addVideo,
  addVideoTest,
  addView,
  addWatchedVideo,
  deleteVideo,
  editVideo,
  fetchVideos,
  getDenidedVideosBySearch,
  getPendingVideosBySearch,
  getTopView,
  getUserVideos,
  getUserVideosPending,
  getVideo,
  getVideosBySearch,
  getWatched,
} from '../controller/videoController.js'
import auth from '../middleware/auth.js'
const router = express.Router()

router.post('/watched/:videoId', auth, addWatchedVideo)
router.post('/test', addVideoTest)
router.post('/', auth, addVideo)

router.delete('/:videoId', auth, deleteVideo)

router.patch('/approve/:videoId', auth, ApproveVideo)
router.patch('/deny/:videoId', auth, DenyVideo)
router.patch('/addview/:id', addView)
router.patch('/:videoId', auth, editVideo)

router.get('/author/pending', getUserVideosPending)
router.get('/search/denided', getDenidedVideosBySearch)
router.get('/search/pending', getPendingVideosBySearch)
router.get('/search', getVideosBySearch)
router.get('/author', getUserVideos)
router.get('/topview', getTopView)
router.get('/watched', auth, getWatched)
router.get('/:id', getVideo)
router.get('/', fetchVideos)

export default router

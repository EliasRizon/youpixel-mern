import express from 'express'
import {
  addVideo,
  addView,
  addWatchedVideo,
  deleteVideo,
  editVideo,
  fetchVideos,
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

router.post('/', auth, addVideo)
router.post('/watched/:videoId', auth, addWatchedVideo)

router.delete('/:videoId', auth, deleteVideo)

router.patch('/:videoId', auth, editVideo)
router.patch('/addview/:id', addView)

router.get('/author/pending', getUserVideosPending)
router.get('/search/pending', getPendingVideosBySearch)
router.get('/search', getVideosBySearch)
router.get('/author', getUserVideos)
router.get('/topview', getTopView)
router.get('/watched', auth, getWatched)
router.get('/:id', getVideo)
router.get('/', fetchVideos)

export default router

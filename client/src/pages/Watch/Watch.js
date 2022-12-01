import styles from './Watch.module.scss'
import classNames from 'classnames/bind'
import { Link, useSearchParams } from 'react-router-dom'
import WatchVideoBoxs from '~/components/Boxs/WatchVideoBoxs/WatchVideoBoxs'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addView, dislike, getVideo, like } from '~/actions/videoActions'
import { addWatchedVideo, fetchChannel } from '~/api/api'
import { ShareIcon } from '~/components/icons'
import Moment from 'react-moment'
import 'moment/locale/vi'
import { signin, sub, unsub } from '~/actions/authActions'
import SubcribeButton from '~/components/Buttons/SubcribeButton'
import LikeButton from '~/components/Buttons/LikeButton'
import Comments from '~/components/Comments'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import Loading from '~/components/Loading'
import FilterBar from '~/components/FilterBar'

const cn = classNames.bind(styles)

function Watch() {
  const { video, isLoading } = useSelector((store) => store.videoReducer)
  const [channel, setChannel] = useState({})
  const [searchParams] = useSearchParams({})
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('profile')),
  )

  const dispatch = useDispatch()

  const videoId = searchParams.get('v')

  const handleLike = async () => {
    dispatch(like(video._id, currentUser.result._id))
  }
  const handleDislike = async () => {
    dispatch(dislike(video._id, currentUser.result._id))
  }

  const handleSub = async () => {
    if (currentUser?.result.subscribedUsers.includes(channel._id)) {
      let archive = structuredClone(currentUser)
      archive.result.subscribedUsers.splice(
        archive.result.subscribedUsers.findIndex(
          (item) => item === channel._id,
        ),
      )
      setCurrentUser(archive)
      setChannel({ ...channel, subscribers: channel.subscribers - 1 })
      dispatch(unsub(channel._id, setCurrentUser))
    } else {
      setCurrentUser({
        ...currentUser,
        result: { ...currentUser.result, subscribedUsers: channel._id },
      })
      setChannel({ ...channel, subscribers: channel.subscribers + 1 })
      dispatch(sub(channel._id, setCurrentUser))
    }
  }

  const handleLogin = useGoogleLogin({
    onSuccess: async (respose) => {
      try {
        const res = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${respose.access_token}`,
            },
          },
        )
        dispatch(
          signin({
            name: res.data.name,
            email: res.data.email,
            picture: res.data.picture,
          }),
        )
      } catch (err) {
        console.log(err)
      }
    },
  })

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    if (video?.userId) {
      const getChannel = async () => {
        const { data } = await fetchChannel(video?.userId)
        setChannel(data)
      }
      getChannel()
    }
  }, [video?.userId])

  useEffect(() => {
    if (video._id) {
      const addWatched = setTimeout(async () => {
        await addWatchedVideo(video._id)
      }, 1000)
      const addVideoView = setTimeout(() => {
        dispatch(addView(video._id))
      }, 30000)
      return () => {
        clearTimeout(addVideoView)
        clearTimeout(addWatched)
      }
    }
  }, [dispatch, video._id])

  useEffect(() => {
    dispatch(getVideo(videoId))
  }, [dispatch, videoId])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className={cn('wrapper')}>
      <div className={cn('primary')}>
        {
          <video
            className={cn('video-player')}
            src={video.videoUrl}
            controls
            // autoPlay
          ></video>
        }
        <div className={cn('video-info-wrapper')}>
          <h2 className={cn('video-name')}>{video.title}</h2>
          <div className={cn('video-options-wrapper')}>
            <div className={cn('channel-wrapper')}>
              {channel?.picture ? (
                <Link to={`/channel/${channel._id}`}>
                  <img
                    className={cn('channel-picture')}
                    src={channel.picture}
                    alt="ChannelPicture"
                  />
                </Link>
              ) : (
                <div className={cn('channel-picture')}></div>
              )}

              <div className={cn('channel-text')}>
                <Link
                  to={`/channel/${channel._id}`}
                  className={cn('channel-name')}
                >
                  {channel.name}
                </Link>
                <div className={cn('channel-sub')}>
                  {channel.subscribers} người đăng ký
                </div>
              </div>
              <SubcribeButton
                currentUser={currentUser}
                channel={channel}
                handleSub={handleSub}
                handleLogin={handleLogin}
              />
            </div>
            <div className={cn('options-wrapper')}>
              <LikeButton
                video={video}
                currentUser={currentUser}
                handleLike={handleLike}
                handleDislike={handleDislike}
                handleLogin={handleLogin}
              />
              <button className={cn('share-btn')}>
                <ShareIcon />
                <span className={cn('like-btn-text')}>Chia sẻ</span>
              </button>
            </div>
          </div>
          <div className={cn('video-desc-wrapper')}>
            <div className={cn('video-views-and-time')}>
              <span>{video.views} lượt xem</span>
              <div style={{ width: '12px' }}></div>
              <span>
                <Moment fromNow>{video.createdAt}</Moment>
              </span>
            </div>
            <div className={cn('video-desc')}>{video.desc}</div>
          </div>

          <Comments
            videoId={video?._id}
            currentUser={currentUser}
            handleLogin={handleLogin}
          />
        </div>
      </div>
      <div className={cn('secondary')}>
        <div className={cn('filter-bar')}>
          <FilterBar />
        </div>
        <WatchVideoBoxs />
      </div>
    </div>
  )
}

export default Watch

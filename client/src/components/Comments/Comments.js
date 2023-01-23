import styles from './Comments.module.scss'
import classNames from 'classnames/bind'
import unName from '~/assets/images/unnamed.jpg'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { addComment } from '~/actions/commentActions'
import { getComments } from '~/api/api'
import Comment from './Comment'
import { toast } from 'react-toastify'
import Loading from '../Loading'

const cn = classNames.bind(styles)

function Comments({ videoId, currentUser, handleLogin }) {
  const [open, setOpen] = useState(false)
  const dispatch = useDispatch()
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [numOfComments, setNumOfComments] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [numberOfPages, setNumberOfPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [update, setUpdate] = useState(false)

  const handleComment = async () => {
    dispatch(addComment(comment, videoId))
    setComment('')
    setOpen(false)
    setUpdate((prev) => !prev)
  }

  const getMoreComments = useCallback(async () => {
    if (page >= numberOfPages) {
      setHasMore(false)
    }
    const { data } = await getComments(videoId, page)
    setComments((prev) => prev.concat(data.data))
    setPage((prev) => ++prev)
    setNumOfComments(data.total)
    setNumberOfPages(data.numberOfPages)
    setIsLoading(false)
  }, [numberOfPages, page, videoId])

  const notify = () =>
    toast.success('Xóa bình luận thành công.', {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

  const notify2 = () =>
    toast.success('Báo vi phạm bình luận thành công.', {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
    })

  const intObserver = useRef()

  const scrollThreshold = useCallback(
    (threshold) => {
      if (isLoading) return

      if (intObserver.current) intObserver.current.disconnect()

      intObserver.current = new IntersectionObserver((items) => {
        if (items[0].isIntersecting && hasMore) {
          setIsLoading(true)
          getMoreComments()
        }
      })

      if (threshold) intObserver.current.observe(threshold)
    },
    [getMoreComments, hasMore, isLoading],
  )

  useEffect(() => {
    setHasMore(false)
    const Comments = async () => {
      const { data } = await getComments(videoId, 1)
      setComments(data.data)
      setNumOfComments(data.total)
      setNumberOfPages(data.numberOfPages)
      setPage(2)
      if (data.total <= 20) {
        setHasMore(false)
      } else {
        setHasMore(true)
      }
    }
    Comments()
  }, [videoId, update])

  return (
    <>
      <div className={cn('comment-header')}>
        <span className={cn('numof-comment')}>{numOfComments} bình luận</span>
      </div>
      <div className={cn('comment-box')}>
        <div className={cn('user-comment-wrap')}>
          {currentUser ? (
            <img
              referrerPolicy="no-referrer"
              className={cn('user-img')}
              src={currentUser?.result.picture}
              alt="UserImg"
            />
          ) : (
            <img className={cn('user-img')} src={unName} alt="UserImg" />
          )}

          <div className={cn('comment-imput-wrapper')}>
            {currentUser ? (
              <textarea
                className={cn('comment-imput')}
                placeholder="Viết bình luận..."
                rows="1"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onClick={() => {
                  setOpen(true)
                }}
              ></textarea>
            ) : (
              <textarea
                className={cn('comment-imput')}
                placeholder="Viết bình luận..."
                rows="1"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onClick={handleLogin}
              ></textarea>
            )}

            {open && (
              <div className={cn('comment-btn')}>
                <button
                  className={cn('btn', 'close-btn')}
                  onClick={() => {
                    setComment('')
                    setOpen(false)
                  }}
                >
                  Hủy
                </button>
                {comment.length > 0 ? (
                  <button
                    className={cn('btn', 'btn-active')}
                    onClick={() => {
                      handleComment()
                    }}
                  >
                    Bình luận
                  </button>
                ) : (
                  <div className={cn('btn', 'btn-inactive')}>Bình luận</div>
                )}
              </div>
            )}
          </div>
        </div>
        {comments.map((comment) => (
          <Comment
            key={comment._id}
            comment={comment}
            currentUser={currentUser}
            notify={notify}
            notify2={notify2}
            videoId={videoId}
            comments={comments}
            setComments={setComments}
            setNumOfComments={setNumOfComments}
            handleLogin={handleLogin}
          />
        ))}
        {isLoading && <Loading mgt="0px" size="3em" />}
        <div className={cn('scrollThreshold')} ref={scrollThreshold}></div>
      </div>
    </>
  )
}

export default Comments

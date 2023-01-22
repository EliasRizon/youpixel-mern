import styles from './TopViews.module.scss'
import classNames from 'classnames/bind'
import SearchVideoBox from '~/components/Boxs/SearchVideoBox'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getTopView } from '~/api/api'
import Loading from '~/components/Loading'

const cn = classNames.bind(styles)

function TopViews() {
  const [videos, setVideos] = useState([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [numberOfPages, setNumberOfPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const getMoreVideos = useCallback(async () => {
    if (page >= numberOfPages) {
      setHasMore(false)
    }
    const { data } = await getTopView(page)
    setVideos((prev) => prev.concat(data.data))
    setPage((prev) => ++prev)
    setNumberOfPages(data.numberOfPages)
    setIsLoading(false)
  }, [numberOfPages, page])

  const intObserver = useRef()

  const scrollThreshold = useCallback(
    (threshold) => {
      if (isLoading) return

      if (intObserver.current) intObserver.current.disconnect()

      intObserver.current = new IntersectionObserver((items) => {
        if (items[0].isIntersecting && hasMore) {
          setIsLoading(true)
          getMoreVideos()
        }
      })

      if (threshold) intObserver.current.observe(threshold)
    },
    [getMoreVideos, hasMore, isLoading],
  )

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    const getdata = async () => {
      const { data } = await getTopView(1)
      setVideos(data.data)
      setNumberOfPages(data.numberOfPages)
      setPage(2)
      setIsPageLoading(false)
      setIsLoading(false)
      if (data.data.total <= 20) {
        setHasMore(false)
      } else {
        setHasMore(true)
      }
    }
    getdata()
  }, [])

  if (isPageLoading) {
    return <Loading />
  }

  return (
    <>
      <div className={cn('wrapper-title')}>
        <div
          className={cn('title-img')}
          style={{
            backgroundImage:
              'url(https://www.youtube.com/img/trending/avatar/trending_avatar.png)',
          }}
        ></div>

        <h2 className={cn('channel-name')}>Xu hướng</h2>
      </div>
      <div className={cn('separate')}></div>
      <div className={cn('wrapper-videos')}>
        {videos.map((video) => (
          <SearchVideoBox key={video._id} video={video} />
        ))}
      </div>
      {isLoading && <Loading mgt="0px" size="3em" />}
      <div className={cn('scrollThreshold')} ref={scrollThreshold}></div>
    </>
  )
}

export default TopViews

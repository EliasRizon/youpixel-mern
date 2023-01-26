import classNames from 'classnames/bind'
import styles from './Sidebar.module.scss'
import { MenuItem } from './Menu'
import {
  HomeIcon,
  HomeIconActive,
  LikeIcon,
  MyVideosIcon,
  TopViewsIcon,
  TopViewsIconActive,
  WatchedIcon,
  WatchedIconActive,
} from '../../icons'
import { useDispatch, useSelector } from 'react-redux'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { signin } from '~/actions/authActions'
import { useEffect, useState } from 'react'
import Button from '~/components/Button'

const cn = classNames.bind(styles)

function Sidebar() {
  const { reload } = useSelector((store) => store.authReducer)
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('profile')),
  )

  const dispatch = useDispatch()

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
    setCurrentUser(JSON.parse(localStorage.getItem('profile')))
  }, [reload])

  return (
    <aside className={cn('wrapper')}>
      <nav className={cn('nav-wrap')}>
        <div
          className={cn('nav-box')}
          style={{ borderTop: 'none', marginTop: '0' }}
        >
          <MenuItem
            to={'/'}
            title="Trang chủ"
            icon={<HomeIcon />}
            activeIcon={<HomeIconActive />}
          ></MenuItem>
          {/* <MenuItem
            to={'/notyet'}
            title="Kênh đăng ký"
            icon={<SubcribedIcon />}
          ></MenuItem> */}
        </div>
        <div className={cn('nav-box')}>
          {currentUser?.result ? (
            <>
              <MenuItem
                to={'/feed/history'}
                title="Video đã xem"
                icon={<WatchedIcon />}
                activeIcon={<WatchedIconActive />}
              ></MenuItem>
              <MenuItem
                to={'/studio/videos/upload'}
                title="Video của bạn"
                icon={<MyVideosIcon />}
              ></MenuItem>
              <MenuItem
                to={'/liked'}
                title="Video đã thích"
                icon={<LikeIcon pathFill="white" />}
                activeIcon={<LikeIcon pathFill="var(--primary-color)" />}
              ></MenuItem>
            </>
          ) : (
            <>
              <button className={cn('menu-item')} onClick={handleLogin}>
                <div className={cn('wrap')}>
                  <span className={cn('icon')}>
                    <WatchedIcon />
                  </span>
                  <span className={cn('title')}>Video đã xem</span>
                </div>
              </button>
              <button className={cn('menu-item')} onClick={handleLogin}>
                <div className={cn('wrap')}>
                  <span className={cn('icon')}>
                    <MyVideosIcon />
                  </span>
                  <span className={cn('title')}>Video của bạn</span>
                </div>
              </button>
              <button className={cn('menu-item')} onClick={handleLogin}>
                <div className={cn('wrap')}>
                  <span className={cn('icon')}>
                    <LikeIcon pathFill="white" />
                  </span>
                  <span className={cn('title')}>Video đã thích</span>
                </div>
              </button>
            </>
          )}
        </div>
        {currentUser ? (
          <div className={cn('nav-box')}>
            <h3 className={cn('nav-box-title')}>Kênh đăng ký</h3>
            {currentUser.subscribedUsers
              .slice(0)
              .reverse()
              .map((item) => (
                <MenuItem
                  key={item._id}
                  to={`/channel/${item._id}`}
                  title={item.name}
                  icon={
                    <div
                      referrerPolicy="no-referrer"
                      className={cn('author-img')}
                      style={{ backgroundImage: `url('${item.picture}')` }}
                    ></div>
                  }
                  activeIcon={
                    <div
                      referrerPolicy="no-referrer"
                      className={cn('author-img')}
                      style={{ backgroundImage: `url('${item.picture}')` }}
                    ></div>
                  }
                ></MenuItem>
              ))}

            {currentUser.subscribedUsers.length === 0 && (
              <div className={cn('guide-signin')}>
                Những kênh bạn đăng ký sẽ được hiển thị ở đây.
              </div>
            )}
          </div>
        ) : (
          <>
            <div className={cn('nav-box')}>
              <div className={cn('guide-signin')}>
                Hãy đăng nhập để thích video, bình luận và đăng ký kênh.
              </div>
              <Button
                className={cn('signin-btn')}
                children="Đăng nhập"
                small
                normal
                onClick={handleLogin}
              />
            </div>
          </>
        )}

        <div className={cn('nav-box')}>
          <h3 className={cn('nav-box-title')}>Khám phá</h3>
          <MenuItem
            to={'/topviews'}
            title="Xu hướng"
            icon={<TopViewsIcon />}
            activeIcon={<TopViewsIconActive />}
          ></MenuItem>
        </div>
      </nav>
      <div className={cn('footer')}>
        <div className={cn('footer-box')}>
          <div className={cn('footer-link')}>Giới thiệu</div>
          <div className={cn('footer-link')}>Điều khoản</div>
          <div className={cn('footer-link')}>Quyền riêng tư</div>
          <div className={cn('footer-link')}>Chích sách và an toàn</div>
          <div className={cn('footer-link')}>Cách YouPixels hoạt động</div>
          <div className={cn('footer-link')}>Thử các tính năng mới</div>
        </div>
        <div className={cn('footer-box')} style={{ padding: '16px 12px' }}>
          <div className={cn('footer-link')}>Một sản phẩm của:</div>
          <div className={cn('footer-link')}>Trịnh Thị Anh</div>
          <div className={cn('footer-link')}>Bùi Quang Thắng</div>
          <div className={cn('footer-link')}>Ngô Văn Thuần</div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

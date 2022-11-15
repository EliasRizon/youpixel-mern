import classNames from 'classnames/bind'
import styles from './StudioSidebar.module.scss'
import { MenuItem } from './Menu'
import { HomeIcon, MyVideosIcon, SubcribedIcon, WatchedIcon } from '../icons'

const cn = classNames.bind(styles)

function StudioSidebar() {
  return (
    <aside className={cn('wrapper')}>
      <div className={cn('start')}>
        <img
          className={cn('user-img')}
          src="https://lh3.googleusercontent.com/a/ALm5wu2IGYTzIgPQZsVlP3NMlVc45QHcC52_hpLlBYbnwA=s96-c"
          alt="user img"
        />
        <div className={cn('user-title')}>Kênh của bạn</div>
        <div className={cn('user-name')}>Tên Người Dùng</div>
      </div>
      <div className={cn('center')}>
        <nav className={cn('nav-wrap')}>
          <div
            className={cn('nav-box')}
            style={{ borderTop: 'none', marginTop: '0', paddingTop: '0' }}
          >
            <MenuItem
              to={'/studio/videos'}
              title="Nội dung"
              icon={<HomeIcon />}
            ></MenuItem>
            <MenuItem
              to={'/notyet'}
              title="Số liệu phân tích"
              icon={<SubcribedIcon />}
            ></MenuItem>
            <MenuItem
              to={'/notyet'}
              title="Bình luận"
              icon={<SubcribedIcon />}
            ></MenuItem>
          </div>
          <div className={cn('nav-box')}>
            <MenuItem
              to={'/notyet'}
              title="Cài đặt"
              icon={<WatchedIcon />}
            ></MenuItem>
            <MenuItem
              to={'/notyet'}
              title="Gửi phản hồi"
              icon={<MyVideosIcon />}
            ></MenuItem>
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default StudioSidebar
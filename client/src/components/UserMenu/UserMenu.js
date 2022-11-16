import classNames from 'classnames/bind'
import { memo } from 'react'
import { HomeIcon } from '../icons'
import styles from './UserMenu.module.scss'
import { UserMenuItem } from './UserMenuItem'

const cn = classNames.bind(styles)

function UserMenu({ menuId, currentUser, logout }) {
  return (
    <div className={cn('user-menu')} id={menuId}>
      <div className={cn('user-menu-info-box')}>
        <img
          className={cn('user-menu-img')}
          src={currentUser?.result.picture}
          alt="user img"
        />
        <div className={cn('user-menu-name')}>{currentUser?.result.name}</div>
      </div>
      <div className={cn('group-btn')}>
        <UserMenuItem title="Kênh của bạn" icon={<HomeIcon />}></UserMenuItem>
        <UserMenuItem
          to="/studio/videos/upload"
          title="Quản lý kênh"
          icon={<HomeIcon />}
        ></UserMenuItem>
        <button className={cn('logout-btn')} onClick={logout}>
          <span className={cn('logout-icon')}>
            <HomeIcon fill="white" />
          </span>
          <span className={cn('logout-text')}>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}

export default memo(UserMenu)

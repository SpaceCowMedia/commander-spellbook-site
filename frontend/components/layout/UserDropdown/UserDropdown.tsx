import styles from './userDropdown.module.scss'
import React, {useEffect, useState} from "react";
import {Cookies, useCookies} from "react-cookie";
import CookieService from "../../../services/cookie.service";
import Link from "next/link";

type Props = {

}
const UserDropdown = ({}: Props) => {

  const [cookies, setCookies] = useCookies(['csbUsername', 'csbJwt', 'csbIsStaff'])
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (cookies.csbJwt && cookies.csbUsername)  setUsername(cookies.csbUsername)
  }, [])

  const signOut = () => {
    CookieService.logout()
    setUsername('')
  }

  if (!username) return null

  return (
    <button tabIndex={0} className={styles.dropdown}>
      <div className={styles.userDropdownButton}>
        <div
          className={styles.discordIcon}
          aria-hidden="true"
        />
          <span className="ml-2 hidden md:flex">{username}</span>
        <div className={styles.dropdownContent}>
          <Link href='/submit-a-combo'>
            <button className={styles.dropdownItem}>Submit Combo</button>
          </Link>
          {cookies.csbIsStaff && (
          <a href='https://backend.commanderspellbook.com/admin/'>
            <button className={styles.dropdownItem}>Admin Page</button>
          </a>)}

          <button className={styles.dropdownItem} onClick={signOut}>Sign out</button>
        </div>
      </div>
    </button>
  )

}

export default UserDropdown

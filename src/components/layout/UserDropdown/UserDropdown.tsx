import styles from './userDropdown.module.scss';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import CookieService from '../../../services/cookie.service';
import Link from 'next/link';

const UserDropdown: React.FC = () => {
  const [cookies, _setCookies] = useCookies(['csbUsername', 'csbJwt', 'csbIsStaff']);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (cookies.csbJwt && cookies.csbUsername) {
      setUsername(cookies.csbUsername);
    }
  }, []);

  const signOut = () => {
    CookieService.logout();
    setUsername('');
  };

  if (!username) {
    return null;
  }

  return (
    <div tabIndex={0} className={styles.dropdown}>
      <div className={styles.userDropdownButton}>
        <div className={styles.discordIcon} aria-hidden="true" />
        <span className="ml-2 hidden md:flex">{username}</span>
        <div className={styles.dropdownContent}>
          <Link href="/submit-a-combo">
            <button type="button" className={styles.dropdownItem}>
              Submit Combo
            </button>
          </Link>
          {cookies.csbIsStaff && (
            <Link onClick={() => console.log('hello')} href={`${process.env.NEXT_PUBLIC_EDITOR_BACKEND_URL}/admin/`}>
              <button type="button" className={styles.dropdownItem}>
                Admin Page
              </button>
            </Link>
          )}

          <button type="button" className={styles.dropdownItem} onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDropdown;

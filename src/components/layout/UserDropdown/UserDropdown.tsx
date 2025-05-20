import styles from './userDropdown.module.scss';
import React, { useEffect, useState } from 'react';
import CookieService from '../../../services/cookie.service';
import Link from 'next/link';

const UserDropdown: React.FC = () => {
  const [username, setUsername] = useState('');
  const [csbIsStaff, setCsbIsStaff] = useState(false);

  useEffect(() => {
    const csbJwt = CookieService.get('csbJwt');
    if (!csbJwt) {
      return;
    }
    const csbUsername = CookieService.get('csbUsername');
    if (csbUsername) {
      setUsername(csbUsername);
    }
    const isStaff = CookieService.get('csbIsStaff') === 'true';
    if (isStaff) {
      setCsbIsStaff(true);
    }
  }, []);

  const signOut = () => {
    CookieService.logout();
    setUsername('');
    setCsbIsStaff(false);
  };

  if (!username) {
    return false;
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
          <Link href="/my-submissions">
            <button type="button" className={styles.dropdownItem}>
              My Submissions
            </button>
          </Link>
          <Link href="/my-update-submissions">
            <button type="button" className={styles.dropdownItem}>
              My Update Submissions
            </button>
          </Link>
          {csbIsStaff && (
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

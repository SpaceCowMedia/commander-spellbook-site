import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './analyticsCookieBanner.module.scss';

const AnalyticsCookieBanner = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAccept = () => {
    setIsOpen(false);
    localStorage.setItem('GDPR:accepted', 'true');
    location.reload();
  };

  const handleDeny = () => {
    setIsOpen(false);
    localStorage.setItem('GDPR:accepted', 'false');
  };

  useEffect(() => {
    const hasSetGDPRChoice = Boolean(localStorage.getItem('GDPR:accepted') || '');
    setIsOpen(!hasSetGDPRChoice);
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="border-b-2 border-dark lg:flex items-center p-4 bg-white shadow-lg justify-center w-full text-dark">
      <div className="text-5xl pb-2 leading-none text-center">🍪</div>
      <div className="lg:mx-8 text-center">
        <p>
          Can we use cookies for analytics? Read&nbsp;
          <Link href="/privacy-policy/">the privacy policy</Link>
          &nbsp;for more information.
        </p>
      </div>
      <div className="flex justify-center mt-4 lg:mt-0">
        <button id="cookie-accept-button" className={`${styles.button} button`} onClick={handleAccept}>
          Sure!
        </button>
        <button id="cookie-deny-button" className={`${styles.button} button`} onClick={handleDeny}>
          Nope
        </button>
      </div>
    </div>
  );
};

export default AnalyticsCookieBanner;

import { useEffect, useState } from 'react';
import Link from 'next/link';

const AnalyticsCookieBanner = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Once answered, the banner folds away and stays folded until the page is loaded again.
  const [answered, setAnswered] = useState(false);

  const handleAccept = () => {
    setAnswered(true);
    localStorage.setItem('GDPR:accepted', 'true');
    location.reload();
  };

  const handleDeny = () => {
    setAnswered(true);
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
    <div
      inert={answered}
      className={`grid shadow-lg transition-[grid-template-rows,opacity] duration-300 ease-out starting:grid-rows-[0fr] motion-reduce:transition-none ${answered ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr]'}`}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="border-b-2 border-dark lg:flex items-center p-4 bg-white justify-center w-full text-dark">
          <div className="text-5xl pb-2 leading-none text-center">🍪</div>
          <div className="lg:mx-8 text-center">
            <p>
              Can we use cookies for analytics? Read&nbsp;
              <Link href="/privacy-policy/">the privacy policy</Link>
              &nbsp;for more information.
            </p>
          </div>
          <div className="flex justify-center mt-4 lg:mt-0">
            <button id="cookie-accept-button" className="button" onClick={handleAccept}>
              Sure!
            </button>
            <button id="cookie-deny-button" className="button" onClick={handleDeny}>
              Nope
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCookieBanner;

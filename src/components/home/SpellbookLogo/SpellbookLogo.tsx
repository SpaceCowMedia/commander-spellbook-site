import React, { ViewTransition } from 'react';
import { LOGO_DOCK, SITE_LOGO } from 'lib/viewTransitions';

const SpellbookLogo: React.FC = () => {
  return (
    <div className="sm:flex mt-4 md:mt-0 justify-center">
      <div className="mb-4 sm:mb-0">
        <ViewTransition name={SITE_LOGO} share={LOGO_DOCK} default="none">
          <img
            src="/images/logo.svg"
            className="h-32 inline-block md:h-48 lg:h-56"
            alt="Commander Spellbook Logo"
            aria-hidden="true"
          />
        </ViewTransition>
      </div>
      <div className="sm:ml-4">
        <h1 className="sr-only">Commander Spellbook</h1>
        <img
          src="/images/title.svg"
          className="h-32 inline-block md:h-48 lg:h-56"
          alt="Commander Spellbook"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default SpellbookLogo;

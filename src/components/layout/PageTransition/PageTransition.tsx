import React, { ViewTransition } from 'react';
import { NO_ANIMATION } from 'lib/viewTransitions';

const ENTER = { [NO_ANIMATION]: 'none', default: 'pageEnter' };
const EXIT = { [NO_ANIMATION]: 'none', default: 'pageExit' };

interface Props {
  children: React.ReactNode;
}

const PageTransition: React.FC<Props> = ({ children }) => (
  <ViewTransition enter={ENTER} exit={EXIT} default="none">
    {children}
  </ViewTransition>
);

export default PageTransition;

import HttpErrorPage from 'components/ui/HttpErrorPage/HttpErrorPage';
import React from 'react';

const UnknownErrorPage: React.FC = () => {
  return <HttpErrorPage status={500} />;
};

export default UnknownErrorPage;

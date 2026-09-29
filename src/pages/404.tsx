import HttpErrorPage from '../components/layout/HttpErrorPage/HttpErrorPage';
import React from 'react';

const NotFoundPage: React.FC = () => {
  return <HttpErrorPage status={404} />;
};

export default NotFoundPage;

import styles from './dimmer.module.scss';
import Loader from 'components/ui/Loader/Loader';
import classNames from 'lib/react/classNames';
import React from 'react';

interface Props {
  loading?: boolean;
  dark?: boolean;
  onClick?: () => void;
}

const Dimmer: React.FC<Props> = ({ loading, dark, onClick }) => {
  return (
    <div onClick={onClick} className={classNames(styles.dimmer, dark && styles.dark)}>
      {loading && <Loader />}
    </div>
  );
};

export default Dimmer;

import styles from './Dimmer.module.scss';
import Loader from 'components/layout/Loader/Loader';
import classNames from 'classnames';
import React from 'react';

type Props = {
  loading?: boolean;
  dark?: boolean;
  onClick?: () => void;
};

const Dimmer: React.FC<Props> = ({ loading, dark, onClick }) => {
  return (
    <div onClick={onClick} className={classNames(styles.dimmer, dark && styles.dark)}>
      {loading && <Loader />}
    </div>
  );
};

export default Dimmer;

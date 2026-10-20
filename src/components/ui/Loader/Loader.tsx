import React from 'react';
import styles from './loader.module.scss';

interface Props {
  centered?: boolean;
}

const Loader: React.FC<Props> = ({ centered }) => {
  const spinner = (
    <div
      className="inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status"
    >
      <span className="absolute! -m-px! h-px! w-px! overflow-hidden! whitespace-nowrap! border-0! p-0! [clip:rect(0,0,0,0)]!">
        Loading...
      </span>
    </div>
  );
  return centered ? <div className={styles.centered}>{spinner}</div> : spinner;
};

export default Loader;

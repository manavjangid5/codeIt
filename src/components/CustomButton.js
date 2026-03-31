import React from 'react';
import { createStyles } from 'antd-style';

const useStyles = createStyles(() => ({
  button: {
    backgroundColor: '#1c1e29',
    color: '#eee',
    border: '1.5px solid #eee',
    borderRadius: '6px',
    height: '24px',
    display: 'flex',
    margin: '8px',
    alignItems: 'center',
    padding: '0 10px',
    cursor: 'pointer',
    fontSize: '14px',

    ':hover': {
      backgroundColor: '#2a2d3a !important', // same as dropdown button
      color: '#4aed88 !important',
      borderColor: '#4aed88 !important',
    },

    ':focus': {
      backgroundColor: '#1c1e29 !important',
      color: '#eee !important',
      borderColor: '#eee !important',
    },
  },
}));

const CustomButton = ({ label, onClick }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.button} onClick={onClick}>
      {label}
    </div>
  );
};

export default CustomButton;
import React, { useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Flex, Space } from 'antd';
import { createStyles } from 'antd-style';

const useStyles = createStyles(() => ({
  root: {
    backgroundColor: '#1c1e29',
    borderRadius: '8px',
    padding: '6px',
    minWidth: '140px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    zIndex: 9999,
  },

  item: {
    padding: '6px 10px',
    margin: '4px 0',
    cursor: 'pointer',
    color: '#eee',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'all 0.2s ease',

    ':hover': {
      backgroundColor: '#2a2d3a',
    },
  },

  button: {
  backgroundColor: '#1c1e29',
  color: '#eee',
  border: '1.5px solid #eee',
  borderRadius: '6px',
  height: '24px',
  display: 'flex',
  margin: '8px',
  alignItems: 'center',

  ':hover': {
    backgroundColor: '#2a2d3a !important', //added !important
    color: '#4aed88 !important',           //changed color + added !important
    borderColor: '#4aed88 !important',     //optional for consistency
  },
  ':focus': {
    backgroundColor: '#1c1e29 !important', //added !important
    color: '#eee !important',
    borderColor: '#eee !important',
  },
},
}));

const DropButton = ({ items, buttonName, setSelectedLang }) => {
  const { styles } = useStyles();
  const [open, setOpen] = useState(false);

  const handleItemClick = (item) => {
    if (setSelectedLang) {
      setSelectedLang(item);
    }
    setOpen(false); // close dropdown
  };

  const dropdownContent = (
    <div className={styles.root}>
      {items.map((item) => (
        <div
          key={item.language}
          className={styles.item}
          onClick={() => handleItemClick(item)}
        >
          {item.name}
        </div>
      ))}
    </div>
  );

  return (
    <Flex>
      <Dropdown
        open={open}
        onOpenChange={(flag) => setOpen(flag)}
        dropdownRender={() => dropdownContent}
        trigger={['click']}
        overlayStyle={{ zIndex: 9999 }}
      >
        <Button className={styles.button}>
          <Space>
            {buttonName}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>
    </Flex>
  );
};

export default DropButton;
import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Flex, Spin } from 'antd';
const LoadSpin = () => (
  <Flex align="center" gap="medium">
    {/* <Spin indicator={<LoadingOutlined spin />} size="small" />
    <Spin indicator={<LoadingOutlined spin />} />
    <Spin indicator={<LoadingOutlined spin />} size="large" /> */}
    <Spin indicator={<LoadingOutlined style={{ fontSize: 14, color: "#4aed88" }} spin />} />
  </Flex>
);
export default LoadSpin;
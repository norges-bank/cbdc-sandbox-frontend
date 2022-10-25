import React from 'react';
import { Box } from '@mui/material';

const Banner = () => {
  const [show] = React.useState(true);

  return (
    <>
      {show ? (
        <Box
          className="center"
          style={{ backgroundColor: '#7AB2CD', padding: '10px 10px 1px 10px' }}>
          <h5
            style={{
              color: 'white',
              textAlign: 'center',
              marginTop: '5px',
              marginRight: '50px',
              fontSize: '14px'
            }}>
            This feature is still under construction and not fully tested yet
          </h5>
        </Box>
      ) : (
        ''
      )}
    </>
  );
};

export default Banner;

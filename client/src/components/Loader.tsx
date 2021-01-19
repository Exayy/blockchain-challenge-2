import { Box, CircularProgress, Typography } from '@material-ui/core';
import React, { FC } from 'react';

type Props = {
  message: string;
};

export const Loader: FC<Props> = ({ message }) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <CircularProgress />
      <Box mt={4}>
        <Typography>{message}</Typography>
      </Box>
    </Box>
  );
};

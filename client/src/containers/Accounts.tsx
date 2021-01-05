import {
  createStyles,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { getAccounts } from 'src/contractCalls/getAccounts';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
  })
);

export const Accounts: FC = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [accountAddresses, setAccountAddresses] = useState<Array<string>>([]);

  const refreshAccounts = useCallback(async () => {
    try {
      setAccountAddresses(await getAccounts());
    } catch {
      enqueueSnackbar('Error during accounts list fetching', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  return (
    <div className={classes.root}>
      <List
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            Accounts list
          </ListSubheader>
        }
      >
        {accountAddresses.map((address) => {
          return (
            <ListItem>
              <ListItemText primary={address} secondary="Status : Administrator" />
            </ListItem>
          );
        })}
      </List>
    </div>
  );
};

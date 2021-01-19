export enum AccountStatus {
  Administrator,
  Voter,
  Unknown,
}

export type Account =
  | {
      status: AccountStatus.Administrator;
      address: string;
    }
  | {
      status: AccountStatus.Voter;
      votedProposalId: string;
      address: string;
    }
  | {
      status: AccountStatus.Unknown;
      address: string;
    };

export const AccountsStatusLabel: { [key in AccountStatus]: string } = {
  [AccountStatus.Administrator]: 'Administrateur',
  [AccountStatus.Voter]: 'Votant',
  [AccountStatus.Unknown]: 'Inconnu',
};

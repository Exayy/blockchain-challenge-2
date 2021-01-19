export enum VoteStatus {
  RegisteringVoters = 0,
  ProposalsRegistrationStarted = 1,
  ProposalsRegistrationEnded = 2,
  VotingSessionStarted = 3,
  VotingSessionEnded = 4,
  VotesTallied = 5,
}

export const VoteStatusLabel: { [key in VoteStatus]: string } = {
  [VoteStatus.RegisteringVoters]: 'Enregistrement des votants',
  [VoteStatus.ProposalsRegistrationStarted]: 'Ajouts des propositions',
  [VoteStatus.ProposalsRegistrationEnded]: 'Vote à venir',
  [VoteStatus.VotingSessionStarted]: 'Vote en cours',
  [VoteStatus.VotingSessionEnded]: 'Vote terminé',
  [VoteStatus.VotesTallied]: 'Résultats',
};

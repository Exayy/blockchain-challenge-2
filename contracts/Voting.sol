// SPDX-License-Identifier: MIT
pragma solidity 0.6.11;

import '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @author Fabien Hebert
 * @notice This contract allow a vote handled by a administrator. Voter are able to add proposals and vote for one of them
 * @dev This contract is based on Ownable contract from OpenZepellin
 */
contract Voting is Ownable {
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    struct Proposal {
        string description;
        uint256 voteCount;
    }

    // Events list
    event VoterRegistered(address voterAddress);
    event ProposalRegistered(uint256 proposalId);
    event Voted(address voter, uint256 proposalId, uint256 totalVoteCount);
    event ProposalsRegistrationStarted();
    event ProposalsRegistrationEnded();
    event VotingSessionStarted();
    event VotingSessionEnded();
    event VotesTallied();
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);

    uint256 public winningProposalId;
    Proposal[] public proposals;
    mapping(address => Voter) public voters;
    WorkflowStatus public workflowStatus = WorkflowStatus.RegisteringVoters;

    modifier onlyVoter {
        require(voters[msg.sender].isRegistered == true, 'Only voter can call this function.');
        _;
    }

    constructor() public {
        // We push a "fake proposal", allowing winningProposalId to be equal to 0
        proposals.push(Proposal('No winning proposal, please wait for tally', 0));
    }

    function changeWorkflowStatus(WorkflowStatus newStatus) internal {
        emit WorkflowStatusChange(workflowStatus, newStatus);
        workflowStatus = newStatus;
    }

    /**
     * @notice Add a voter using his address during RegisteringVoters step
     * Requirements:
     * - sender must be the owner of the contract
     */
    function addVoter(address voterAddress) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voter registration is closed');
        require(
            voters[voterAddress].isRegistered == false,
            'This voter has already been registered'
        );
        voters[voterAddress] = Voter(true, false, 0);
        emit VoterRegistered(voterAddress);
    }

    // Vote update
    function startProposalsRegistration() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.RegisteringVoters,
            'This function can only be called when voters registering is opened'
        );
        changeWorkflowStatus(WorkflowStatus.ProposalsRegistrationStarted);
        emit ProposalsRegistrationStarted();
    }

    function endProposalsRegistration() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationStarted,
            "This function can't be called because proposal registering isn't opened"
        );
        changeWorkflowStatus(WorkflowStatus.ProposalsRegistrationEnded);
        emit ProposalsRegistrationEnded();
    }

    function startVotingSession() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationEnded,
            'This function can only be called when proposals registering is still opened'
        );
        changeWorkflowStatus(WorkflowStatus.VotingSessionStarted);
        emit VotingSessionStarted();
    }

    function endVotingSession() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.VotingSessionStarted,
            'This function can only be called if voting session is opened'
        );
        changeWorkflowStatus(WorkflowStatus.VotingSessionEnded);
        emit VotingSessionEnded();
    }

    function tally() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.VotingSessionEnded,
            'This function can only be called if vote session is closed and vote has not been tailed yet'
        );
        for (uint256 i = 1; i < proposals.length; i++) {
            if (proposals[i].voteCount > proposals[winningProposalId].voteCount) {
                winningProposalId = i;
            }
        }
        changeWorkflowStatus(WorkflowStatus.VotesTallied);
        emit VotesTallied();
    }

    function addProposal(string memory description) external onlyVoter {
        require(bytes(description).length > 0, 'Proposal must have a description');

        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationStarted,
            'This function can only be called if proposals registration is opened'
        );
        proposals.push(Proposal(description, 0));
        emit ProposalRegistered(proposals.length - 1);
    }

    function vote(uint256 proposalId) external onlyVoter {
        require(
            workflowStatus == WorkflowStatus.VotingSessionStarted,
            'This function can only be called if voting session is opened'
        );

        require(voters[msg.sender].hasVoted == false, 'You can only vote once');
        require(proposalId != 0 && proposalId < proposals.length, "This proposal doesn't exist");
        proposals[proposalId].voteCount++;
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = proposalId;
        emit Voted(msg.sender, proposalId, proposals[proposalId].voteCount);
    }

    function getWinningProposal() external view returns (string memory) {
        require(
            workflowStatus == WorkflowStatus.VotesTallied,
            'This function can only be called if vote is tallied'
        );
        require(proposals.length > 1, 'There were no proposal during this vote');
        return proposals[winningProposalId].description;
    }

    function getProposalCount() external view returns (uint256) {
        return proposals.length - 1;
    }
}

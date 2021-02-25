const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const Voting = artifacts.require("./Voting.sol");


contract("Voting",  (accounts) => {

    // COMMON UTILS
    async function startProposalsRegistration(votingInstance) {
        return await votingInstance.startProposalsRegistration({ from : accounts[0]});
    }

    async function endProposalsRegistration(votingInstance) {
        await votingInstance.endProposalsRegistration({ from : accounts[0]});
    }

    async function startVotingSession(votingInstance) {
        await votingInstance.startVotingSession({ from : accounts[0]});
    }

    async function endVotingSession(votingInstance) {
        await votingInstance.endVotingSession({ from : accounts[0]});
    }

    async function tally(votingInstance) {
        await votingInstance.tally({ from : accounts[0]});
    }

    async function addVoter(votingInstance, address) {
        return await votingInstance.addVoter(address, { from : accounts[0]});
    }

    // BEFORE EACH CONFIG
    beforeEach(async function () {
        this.votingInstance = await Voting.new();
    });

    // TEST IF ADMIN/OWNER CAN CHANGE VOTE STATUS
    it("Le vote est initialisé à l'étape 0", async function () {
        const currentVoteStatus = await this.votingInstance.workflowStatus();
        const expectedVoteStatus = new BN("0");
        expect(currentVoteStatus).to.be.bignumber.equal(expectedVoteStatus);
    })    

    it("L'administrateur peut passer le vote à l'étape 1", async function () {
        const changeStepCall = await startProposalsRegistration(this.votingInstance);
        const newVoteStatus = await this.votingInstance.workflowStatus();
        const expectedVoteStatus = new BN("1");
        expect(newVoteStatus).to.be.bignumber.equal(expectedVoteStatus);
        expectEvent(changeStepCall, 'ProposalsRegistrationStarted');
    })
    
    it("L'administrateur peut passer le vote à l'étape 2", async function () {
        await startProposalsRegistration(this.votingInstance);
        await endProposalsRegistration(this.votingInstance);
        const newVoteStatus = await this.votingInstance.workflowStatus();
        const expectedVoteStatus = new BN("2");
        expect(newVoteStatus).to.be.bignumber.equal(expectedVoteStatus);
    }) 

    it("L'administrateur peut passer le vote à l'étape 3", async function () {
        await startProposalsRegistration(this.votingInstance);
        await endProposalsRegistration(this.votingInstance);
        await startVotingSession(this.votingInstance);
        const newVoteStatus = await this.votingInstance.workflowStatus();
        const expectedVoteStatus = new BN("3");
        expect(newVoteStatus).to.be.bignumber.equal(expectedVoteStatus);
    }) 

    it("L'administrateur peut passer le vote à l'étape 4", async function () {
        await startProposalsRegistration(this.votingInstance);
        await endProposalsRegistration(this.votingInstance);
        await startVotingSession(this.votingInstance);
        await endVotingSession(this.votingInstance);
        const newVoteStatus = await this.votingInstance.workflowStatus();
        const expectedVoteStatus = new BN("4");
        expect(newVoteStatus).to.be.bignumber.equal(expectedVoteStatus);
    })
    
    it("L'administrateur peut passer le vote à l'étape 5", async function () {
        await startProposalsRegistration(this.votingInstance);
        await endProposalsRegistration(this.votingInstance);
        await startVotingSession(this.votingInstance);
        await endVotingSession(this.votingInstance);
        await tally(this.votingInstance);
        const newVoteStatus = await this.votingInstance.workflowStatus();
        const expectedVoteStatus = new BN("5");
        expect(newVoteStatus).to.be.bignumber.equal(expectedVoteStatus);
    }) 

    // TEST : ADD VOTER
    it.only("L'administrateur peut enregistrement un votant", async function () {
        const beforeResult = await this.votingInstance.voters(accounts[1]);
        const addVoterCall = await addVoter(this.votingInstance, accounts[1]);
        const afterResult = await this.votingInstance.voters(accounts[1]);
        expect(beforeResult.isRegistered).to.be.false;
        expect(afterResult.isRegistered).to.be.true;
        expectEvent(addVoterCall, 'VoterRegistered', { voterAddress : accounts[1]});
    }) 

    it("Un autre compte ne peut pas enregistrer un votant", async function () {
        await expectRevert(
            this.votingInstance.addVoter(accounts[1], { from : accounts[2]}),
            'Ownable: caller is not the owner -- Reason given: Ownable: caller is not the owner.',
        );
    });

    // TEST : ADD PROPOSAL
    it("Un votant peut ajouter une proposition", async function () {
        await addVoter(this.votingInstance, accounts[1]);
        await startProposalsRegistration(this.votingInstance);
        const proposalDescription = "Pizza à la cantine"
        await this.votingInstance.addProposal(proposalDescription, { from : accounts[1]});
        const proposal = await this.votingInstance.proposals(1);
        expect(proposal.description).to.be.equal(proposalDescription);
    });

    it("Un NON votant ne peut pas ajouter une proposition", async function () {
        await startProposalsRegistration(this.votingInstance);
        await expectRevert(
            this.votingInstance.addProposal("test", { from : accounts[1]}),
            'Only voter can call this function. -- Reason given: Only voter can call this function..',
        );
    });

    // TEST : VOTE
    it("Un votant peut voter pour une proposition", async function () {
        const proposalDescription = "Pizza à la cantine"

        await addVoter(this.votingInstance, accounts[1]);
        await addVoter(this.votingInstance, accounts[2]);
        await startProposalsRegistration(this.votingInstance);
        await this.votingInstance.addProposal(proposalDescription, { from : accounts[1]});
        await endProposalsRegistration(this.votingInstance);
        await startVotingSession(this.votingInstance);
        await this.votingInstance.vote(1, { from : accounts[1]});
        await this.votingInstance.vote(1, { from : accounts[2]});
        const proposal = await this.votingInstance.proposals(1);

        expect(proposal.description).to.be.equal(proposalDescription);
        expect(proposal.voteCount).to.be.bignumber.equal(new BN("2"));
    });

    // TEST : RESULTS
    it("Le vote fonctionne et le résultat est disponible", async function () {
        const proposal1Test = "Pomme"
        const proposal2Text = "Poire"

        // Etape 0 : Ajouts des votants
        await addVoter(this.votingInstance, accounts[1]);
        await addVoter(this.votingInstance, accounts[2]);
        await addVoter(this.votingInstance, accounts[3]);
        // Etape 1 : Enregistrement des propositions
        await startProposalsRegistration(this.votingInstance);
        await this.votingInstance.addProposal(proposal1Test, { from : accounts[1]});
        await this.votingInstance.addProposal(proposal2Text, { from : accounts[2]});
        // Etape 2 : Fin des propositions
        await endProposalsRegistration(this.votingInstance);
        // Etape 3 : Vote
        await startVotingSession(this.votingInstance);
        await this.votingInstance.vote(1, { from : accounts[1]});
        await this.votingInstance.vote(2, { from : accounts[2]});
        await this.votingInstance.vote(1, { from : accounts[3]});
        // Etape 4 : Vote terminé
        await endVotingSession(this.votingInstance);
        // Etape 5 : Calcul des résultat
        await tally(this.votingInstance);
        // Récupération de la proposition gagnante
        const winningProposalDescription = await this.votingInstance.getWinningProposal({ from : accounts[1]});

        expect(winningProposalDescription).to.be.equal(proposal1Test);
    });
});

pragma solidity >= 0.7.0;

contract Vote {
  uint256 greenVotes;
  uint256 redVotes;

  function vote(bool votedGreen) public {
    if (votedGreen) {
      greenVotes += 1;
    } else {
      redVotes += 1;
    }
  }

  function voteGreen() public {
    greenVotes += 1;
  }

  function getRedVotes() view public returns (uint256) {
    return redVotes;
  }

  function getGreenVotes() view public returns (uint256) {
    return greenVotes;
  }
}
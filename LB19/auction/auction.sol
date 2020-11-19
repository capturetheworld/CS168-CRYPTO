pragma solidity >= 0.7.0;

contract Auction {
  // Using bytes32 is cheaper and tends to work better
  // than using strings.
  mapping(bytes32 => uint256) bids;

  bytes32 highBidder;
  bool firstBid = true;

  function makeBid(bytes32 name, uint256 bid) public {
    require(bids[name] < bid);
    if (firstBid || bid > bids[highBidder]) {
      highBidder = name;
      firstBid = false;
    }
    bids[name] = bid;
  }

  function getHighBidder() view public returns (bytes32) {
    return highBidder;
  }

  function getTopBid() view public returns (uint256) {
    return bids[highBidder];
  }
}
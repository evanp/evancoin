pragma solidity ^0.4.2;

contract EvanCoin {

  address _evan;

  struct Bid {
      address bidder;
      uint hour;
      uint amount;
      uint endTime;
  }

  mapping(uint => address) public owners;
  mapping(uint => Bid) public bids;

  function EvanCoin() {
    _evan = msg.sender;
  }

  function evan() public returns (address) {
      return _evan;
  }

  function owner(uint hour) public returns (address) {
    address found = owners[hour];
    if (found == address(0)) {
      return _evan;
    } else {
      return found;
    }
  }

  function makeBid(uint hour, uint endTime) public payable {
    require(msg.sender != owner(hour));
    var bid = Bid(msg.sender, hour, msg.value, endTime);
    bids[hour] = bid;
  }
}

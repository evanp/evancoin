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
  mapping(address => uint) public pending;

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
    require(msg.value > bids[hour].amount);
    var bid = Bid(msg.sender, hour, msg.value, endTime);
    // Refund the previous bidder
    if (bids[hour].bidder != address(0)) {
      pending[bids[hour].bidder] += bids[hour].amount;
    }
    bids[hour] = bid;
  }

  function acceptBid(uint hour) public {
    address current = owner(hour);
    require(msg.sender == current);
    Bid storage bid = bids[hour];
    require(now < bid.endTime);
    pending[current] += bid.amount;
    owners[hour] = bid.bidder;
    delete bids[hour];
  }

  function withdraw() public {
    uint value = pending[msg.sender];
    require(value > 0);
    msg.sender.transfer(value);
    delete pending[msg.sender];
  }
}

pragma solidity ^0.4.2;

contract EvanCoin {

  address _evan;

  struct Bid {
      address bidder;
      uint hour;
      uint amount;
      uint endTime;
  }

  struct Ask {
      uint hour;
      uint amount;
      uint endTime;
  }

  mapping(uint => address) public owners;
  mapping(uint => Bid) public bids;
  mapping(uint => Ask) public asks;
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

  function transfer(uint hour, address to) public {

    require(msg.sender == owner(hour));

    owners[hour] = to;

    // Refund bids

    Bid memory prev = bids[hour];

    if (prev.bidder != address(0)) {
      pending[prev.bidder] += prev.amount;
      delete bids[hour];
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

  function makeAsk(uint hour, uint amount, uint endTime) public {
    require(msg.sender == owner(hour));
    require(amount > 0);
    delete asks[hour];
    asks[hour] = Ask(hour, amount, endTime);
  }

  function acceptAsk(uint hour) public payable {
    require(msg.sender != owner(hour));
    require(asks[hour].amount > 0);
    require(asks[hour].endTime > now);
    require(msg.value >= asks[hour].amount);
    pending[owner(hour)] += msg.value;
    delete asks[hour];
    owners[hour] = msg.sender;
  }
}

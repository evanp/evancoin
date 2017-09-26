pragma solidity ^0.4.2;

contract EvanCoin {

  address _evan;

  struct Bid {
      address bidder;
      uint hour;
      uint amount;
  }

  struct Ask {
      uint hour;
      uint amount;
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

    if (bids[hour].bidder != address(0)) {
      pending[bids[hour].bidder] += bids[hour].amount;
      delete bids[hour];
    }

    owners[hour] = to;
  }

  function bid(uint hour) public payable {

    require(msg.sender != owner(hour));

    require(msg.value > bids[hour].amount);

    // Refund the previous bidder

    if (bids[hour].bidder != address(0)) {
      pending[bids[hour].bidder] += bids[hour].amount;
      delete bids[hour];
    }

    // If there's an outstanding ask that's satisfied, close immediately.

    if ((asks[hour].amount > 0) &&
        (msg.value >= asks[hour].amount)) {

      pending[owner(hour)] += msg.value;
      delete asks[hour];
      owners[hour] = msg.sender;

    } else {
      bids[hour] = Bid(msg.sender, hour, msg.value);
    }

  }

  function ask(uint hour, uint amount) public {
    require(msg.sender == owner(hour));
    require(amount > 0);
    if (bids[hour].amount >= amount) {
      pending[owner(hour)] += bids[hour].amount;
      owners[hour] = bids[hour].bidder;
      delete bids[hour];
    } else {
      delete asks[hour];
      asks[hour] = Ask(hour, amount);
    }
  }

  function withdraw() public {
    uint value = pending[msg.sender];
    require(value > 0);
    msg.sender.transfer(value);
    delete pending[msg.sender];
  }
}

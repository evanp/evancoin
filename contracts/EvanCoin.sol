pragma solidity ^0.4.4;
import 'zeppelin-solidity/contracts/token/StandardToken.sol';

contract EvanCoin is StandardToken {

  string public name = 'EvanCoin';
  string public symbol = 'fn';
  uint public decimals = 2;
  uint public INITIAL_SUPPLY = 403236;

  function EvanCoin() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }

  struct Offer {
    address owner;
    uint count;
    uint rate;
  }

  struct Bid {
    address bidder;
    uint count;
    uint value;
  }

  Offer[] public offers;
  Bid[] public bids;
  
  function offer(uint count, uint rate) public returns (uint index) {
    require(balanceOf(msg.sender) >= count);
    require(rate > 0);
    offers.length++;
    offers[offers.length-1] = Offer(msg.sender, count, rate);
    balances[msg.sender] -= count;
    return offers.length;
  }

  function bid(uint count) public payable returns (uint index) {
    require(count > 0);
    require(msg.value > 0);
    bids.length++;
    bids[bids.length-1] = Bid(msg.sender, count, msg.value);
    return bids.length;
  }
}

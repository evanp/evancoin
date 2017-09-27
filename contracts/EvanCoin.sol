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

  Offer[] public offers;

  function offer(uint count, uint rate) returns (uint index) {
    require(balanceOf(msg.sender) >= count);
    require(rate > 0);
    offers.length++;
    offers[offers.length-1] = Offer(msg.sender, count, rate);
    balances[msg.sender] -= count;
    return offers.length;
  }
}

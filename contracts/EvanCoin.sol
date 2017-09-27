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

  function offerCount() public returns (uint) {
      return offers.length;
  }

  function offer(uint count, uint rate) public {
    require(balanceOf(msg.sender) >= count);
    require(rate > 0);
    insertOffer(msg.sender, count, rate);
  }

  function insertOffer(address owner, uint count, uint rate) internal {
    var newOffer = Offer(owner, count, rate);
    // extend the offers array by 1
    offers.length++;
    // look through sorted array for the first offer with a higher rate
    for (uint i = 0; i < offers.length; i++) {
      // if it has a strictly higher rate...
      if (rate < offers[i].rate) {
        // shift down
        for (uint j = offers.length - 1; j > i; j--) {
          offers[j] = offers[j - 1];
        }
        // insert here
        offers[i] = newOffer;
        break;
      }
    }
    // Finally, if we get to the end of the array and there is no
    // end item, this must be the highest rate. Add at end.
    if (offers[offers.length-1].owner == address(0)) {
      offers[offers.length-1] = newOffer;
    }
  }

  function bid(uint count) public payable returns (uint index) {
    require(count > 0);
    require(msg.value > 0);
    bids.length++;
    bids[bids.length-1] = Bid(msg.sender, count, msg.value);
    return bids.length;
  }
}

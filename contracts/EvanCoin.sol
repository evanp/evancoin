pragma solidity ^0.4.4;
import 'zeppelin-solidity/contracts/token/StandardToken.sol';

contract EvanCoin is StandardToken {

  event Transaction(address indexed from, address indexed to, uint256 count, uint256 rate);
  event OpenBid(address indexed bidder, uint256 count, uint256 rate);
  event OpenOffer(address indexed owner, uint256 count, uint256 rate);

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
    uint rate;
  }

  Offer[] public offers;
  Bid[] public bids;
  mapping(address => uint) public pending;

  function offerCount() public returns (uint) {
      return offers.length;
  }

  function bidCount() public returns (uint) {
      return bids.length;
  }

  function offer(uint count, uint rate) public {
    require(balanceOf(msg.sender) >= count);
    require(rate > 0);
    // Clear if there are any matching bids
    // High bid is always on top
    while (count > 0 && bids.length > 0 && bids[0].rate >= rate) {
      uint min = (bids[0].count < count) ? bids[0].count : count;
      assert(bids[0].count >= min);
      assert(count >= min);
      bids[0].count -= min;
      count -= min;
      balances[bids[0].bidder] += min;
      pending[msg.sender] += min * rate;
      Transaction(msg.sender, bids[0].bidder, min, rate);
      if (bids[0].rate > rate) {
        pending[bids[0].bidder] += min * (bids[0].rate - rate);
      }
      if (bids[0].count == 0) {
        delete bids[0];
        // shift up
        for (uint j = 1; j < bids.length; j++) {
          bids[j - 1] = bids[j];
        }
        // shorten
        bids.length--;
      }
    }
    // Insert a new offer if there are still some left after clearing bids
    if (count > 0) {
      insertOffer(msg.sender, count, rate);
    }
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
    OpenOffer(owner, count, rate);
  }

  function bid(uint count) public payable {
    require(count > 0);
    require(msg.value > 0);
    // No rounding silliness pls
    require(msg.value % count == 0);
    uint rate = msg.value/count;
    // Clear if there are any matching offers
    while (count > 0 && offers.length > 0 && offers[0].rate <= rate) {
      uint min = (offers[0].count < count) ? offers[0].count : count;
      offers[0].count -= min;
      count -= min;
      balances[msg.sender] += min;
      pending[offers[0].owner] += min * rate;
      Transaction(offers[0].owner, msg.sender, min, rate);
      if (offers[0].count == 0) {
        delete offers[0];
        // shift up
        for (uint j = 1; j < offers.length; j++) {
          offers[j - 1] = offers[j];
        }
        offers.length--;
      }
    }
    if (count > 0) {
      insertBid(msg.sender, count, rate);
    }
  }

  function insertBid(address bidder, uint count, uint rate) internal {

    require(bidder != address(0));
    require(count > 0);
    require(rate > 0);

    var newBid = Bid(bidder, count, rate);

    // extend the bids array by 1
    bids.length++;
    // look through sorted array for the first bid with a higher rate
    for (uint i = 0; i < bids.length; i++) {
      // if it has a strictly higher rate...
      if (rate > bids[i].rate) {
        // shift down
        for (uint j = bids.length - 1; j > i; j--) {
          bids[j] = bids[j - 1];
        }
        // insert here
        bids[i] = newBid;
        break;
      }
    }
    // Finally, if we get to the end of the array and there is no
    // end item, this must be the highest rate. Add at end.
    if (bids[bids.length-1].bidder == address(0)) {
      bids[bids.length-1] = newBid;
    }
    OpenBid(bidder, count, rate);
  }
}

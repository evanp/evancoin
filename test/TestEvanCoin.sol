pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/EvanCoin.sol";

contract TestEvanCoin {
  EvanCoin evancoin = EvanCoin(DeployedAddresses.EvanCoin());

  function testEvanOwnsEverything() {
    address expected = evancoin.evan();
    address owner = evancoin.owner(435938);
    Assert.equal(owner, expected, "Owner of hour 43598 should be Evan");
  }
}

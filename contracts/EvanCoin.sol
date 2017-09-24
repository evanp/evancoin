pragma solidity ^0.4.2;

contract EvanCoin {

  address _evan;
  mapping(uint => address) public owners;

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
}

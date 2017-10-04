pragma solidity ^0.4.4;
import 'zeppelin-solidity/contracts/token/StandardToken.sol';

contract EvanCoin is StandardToken {

  string public name = 'EvanCoin';
  string public symbol = 'EVAN';
  uint public decimals = 2;
  uint public INITIAL_SUPPLY = 40323600;

  function EvanCoin() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }
}

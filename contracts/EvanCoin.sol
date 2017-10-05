pragma solidity ^0.4.4;
import 'zeppelin-solidity/contracts/token/BurnableToken.sol';

contract EvanCoin is BurnableToken {

  string public name = 'EvanCoin';
  string public symbol = 'EVN';
  uint public decimals = 2;
  uint public INITIAL_SUPPLY = 40322400;

  function EvanCoin() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }
}

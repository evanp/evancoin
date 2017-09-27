pragma solidity ^0.4.4;
import 'zeppelin-solidity/contracts/token/MintableToken.sol';

contract EvanCoin is MintableToken {

  string public name = 'EvanCoin';
  string public symbol = 'fn';
  uint public decimals = 2;
  uint public INITIAL_SUPPLY = 403236;

  function EvanCoin() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }
}

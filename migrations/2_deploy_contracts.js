var EvanCoin = artifacts.require("./EvanCoin.sol");
var EvanCoinMarket = artifacts.require("./EvanCoinMarket.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(EvanCoin);
  deployer.deploy(EvanCoinMarket, EvanCoin.address);
  web3.eth.
};

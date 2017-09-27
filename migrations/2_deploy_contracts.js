var EvanCoin = artifacts.require("./EvanCoin.sol");
var EvanCoinCrowdsale = artifacts.require("./EvanCoinCrowdsale.sol");

module.exports = function(deployer) {
  deployer.deploy(EvanCoin);
  deployer.deploy(EvanCoinCrowdsale);
};

var EvanCoin = artifacts.require("./EvanCoin.sol");
var EvanCoinCrowdsale = artifacts.require("./EvanCoinCrowdsale.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(EvanCoinCrowdsale, Date.parse("2017-10-01T00:00:00Z"), Date.parse("2027-10-01T00:00:00Z"), web3.toWei(0.5, "ether"), 20000 *  web3.toWei(0.5, "ether"), accounts[0]);
};

var EvanCoin = artifacts.require("./EvanCoin.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(EvanCoin);
};

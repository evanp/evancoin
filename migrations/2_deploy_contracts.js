var EvanCoin = artifacts.require("./EvanCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(EvanCoin);
};

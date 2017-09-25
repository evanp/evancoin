// Specifically request an abstraction for EvanCoin

require('babel-core/register');

var EvanCoin = artifacts.require("EvanCoin");

contract('EvanCoin', function(accounts) {
  it("should initially mark Evan as the owner of every coin", async () => {
    var instance = await EvanCoin.deployed();
    var owner = await instance.owner.call(43598);
    var evan = await instance.evan.call();
    assert.equal(owner, evan, "Evan is not the owner of a random coin");
  });
});

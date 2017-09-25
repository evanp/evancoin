// Specifically request an abstraction for EvanCoin

require('babel-core/register');

var EvanCoin = artifacts.require("EvanCoin");

contract('EvanCoin', function(accounts) {
  it("should return account zero for evan", async () => {
    var instance = await EvanCoin.deployed();
    var evan = await instance.evan.call();
    assert.equal(evan, accounts[0], "Evan is not the first account");
  });
  it("should initially mark Evan as the owner of every coin", async () => {
    var instance = await EvanCoin.deployed();
    var owner = await instance.owner.call(43598);
    var evan = await instance.evan.call();
    assert.equal(owner, evan, "Evan is not the owner of a random coin");
  });
  it("should let the second account bid for an hour", async () => {
    var instance = await EvanCoin.deployed();
    const END_TIME = Date.now() + (24 * 60 * 60 * 1000);
    const HOUR = 435962;
    const AMOUNT = 1;
    var tx_id = await instance.makeBid(HOUR, END_TIME, {from: accounts[1], value: AMOUNT});
    var bid = await instance.bids.call(HOUR);
    assert.equal(bid[0], accounts[1], "bidder did not get recorded");
    assert.equal(bid[1].c, HOUR, "bid is for the wrong hour");
    assert.equal(bid[2].c, AMOUNT, "bid is for the wrong amount");
    assert.equal(bid[3].c, END_TIME, "bid has wrong end time");
  });
});

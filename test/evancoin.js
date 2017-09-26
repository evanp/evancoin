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
    const AMOUNT = web3.toWei(1, "ether");
    var tx = await instance.makeBid(HOUR, END_TIME, {from: accounts[1], value: AMOUNT});
    var bid = await instance.bids.call(HOUR);
    assert.equal(bid[0], accounts[1], "bidder did not get recorded");
    assert.equal(bid[1].c, HOUR, "bid is for the wrong hour");
    assert.equal(bid[2].toString(), AMOUNT, "bid is for the wrong amount");
    assert.equal(bid[3].c, END_TIME, "bid has wrong end time");
  });
  it("should let the third account bid for an hour which gets accepted", async () => {
    let instance = await EvanCoin.deployed();
    const END_TIME = Date.now() + (24 * 60 * 60 * 1000);
    const HOUR = 435986;
    const AMOUNT = web3.toWei(1, "ether");
    let tx = await instance.makeBid(HOUR, END_TIME, {from: accounts[2], value: AMOUNT});
    tx = await instance.acceptBid(HOUR, {from: accounts[0]});
    let owner = await instance.owner.call(HOUR);
    assert.equal(owner, accounts[2], `Second account is not the owner of the hour (${owner} != ${accounts[2]})`);
    let pending = await instance.pending.call(accounts[0]);
    assert.equal(pending, AMOUNT, `First account was not credited for purchase (${pending} != ${AMOUNT})`);
    let initial = web3.eth.getBalance(accounts[0]);
    let wdtxr = await instance.withdraw({from: accounts[0]});
    let wdtx = web3.eth.getTransaction(wdtxr.tx);
    let gc = wdtxr.receipt.gasUsed * wdtx.gasPrice;
    let final = web3.eth.getBalance(accounts[0]);
    let difference = final.minus(initial).toNumber();
    let expected = parseInt(AMOUNT, 10) - gc;
    assert.equal(difference, expected, `final (${final}) minus initial (${initial}) not equal to AMOUNT ${AMOUNT} minus gc ${gc}`);
    pending = await instance.pending.call(accounts[0]);
    assert.equal(pending, 0, `First account pending was not cleared (${pending} != 0)`);
  });
});

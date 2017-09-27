// Specifically request an abstraction for EvanCoin

require('babel-core/register');

var EvanCoin = artifacts.require("EvanCoin");

contract('EvanCoin', function(accounts) {

  it("should have the right initial variables", async () => {

    let instance = await EvanCoin.deployed();

    let name = await instance.name.call();
    let symbol = await instance.symbol.call();
    let decimals = await instance.decimals.call();
    let INITIAL_SUPPLY = await instance.INITIAL_SUPPLY.call();
    let totalSupply = await instance.totalSupply.call();

    assert.equal(name, "EvanCoin", "Wrong name");
    assert.equal(symbol, "fn", "Wrong symbol");
    assert.equal(decimals, "2", "Wrong decimals");
    assert.equal(INITIAL_SUPPLY, 403236, "Wrong initial supply");
    assert.equal(totalSupply, 403236, "Wrong total supply");
  });

  it("should have the right initial balance", async () => {

    let instance = await EvanCoin.deployed();

    let initial = await instance.balanceOf(accounts[0]);

    assert.equal(initial, 403236, "Wrong initial balance for first account");
  });

  it("should let you offer EvanCoin for sale", async () => {

    var instance = await EvanCoin.deployed();

    const COUNT = 10;
    const RATE = web3.toWei(0.5, "ether");

    let initial = await instance.balanceOf(accounts[0]);

    let tx1 = await instance.offer(COUNT, RATE, {from: accounts[0]});

    let ask = await instance.offers.call(0);

    assert.equal(ask[0], accounts[0], "Wrong ask address");
    assert.equal(ask[1].c, COUNT, "Wrong count");
    assert.equal(ask[2].toString(), RATE, "Wrong rate");

    let final = await instance.balanceOf.call(accounts[0]);

    assert.equal(initial.minus(final).toNumber(), COUNT, "Account not debited");
  });

  it("should let you bid on EvanCoin", async () => {

    var instance = await EvanCoin.deployed();

    const COUNT = 10;
    const RATE = web3.toWei(0.25, "ether");

    let tx1 = await instance.bid(COUNT, {from: accounts[1], value: COUNT * RATE});

    let bid = await instance.bids.call(0);

    assert.equal(bid[0], accounts[1], "Wrong bid address");
    assert.equal(bid[1].c, COUNT, "Wrong count");
    assert.equal(bid[2].toString(), COUNT * RATE, "Wrong value");
  });
});

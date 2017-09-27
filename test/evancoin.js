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

    let initial = await instance.balanceOf.call(accounts[0]);

    assert.equal(initial, 403236, "Wrong initial balance for first account");
  });

  it("should transfer EvanCoin between accounts", async () => {

    let instance = await EvanCoin.deployed();

    const AMOUNT = 100;

    let initial0 = await instance.balanceOf(accounts[0]);
    let initial1 = await instance.balanceOf(accounts[1]);

    let tx1 = await instance.transfer(accounts[1], AMOUNT, {from: accounts[0]});

    let final0 = await instance.balanceOf.call(accounts[0]);
    let final1 = await instance.balanceOf.call(accounts[1]);

    assert.equal(final0.minus(initial0).toNumber(), -1 * AMOUNT, "From account was not debited");
    assert.equal(final1.minus(initial1).toNumber(), AMOUNT, "To account was not debited");
  });

  it("should let you offer EvanCoin for sale", async () => {

    var instance = await EvanCoin.deployed();

    const COUNT = 10;
    const RATE = web3.toWei(0.5, "ether");

    let initial = await instance.balanceOf(accounts[0]);

    let tx1 = await instance.offer(COUNT, RATE, {from: accounts[0]});

    let offer = await instance.offers.call(0);

    assert.equal(offer[0], accounts[0], "Wrong offer address");
    assert.equal(offer[1].c, COUNT, "Wrong count");
    assert.equal(offer[2].toString(), RATE, "Wrong rate");

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

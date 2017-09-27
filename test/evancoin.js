// Specifically request an abstraction for EvanCoin

require('babel-core/register');

let EvanCoin = artifacts.require("EvanCoin");

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

  it("should insert offers in descending order by rate", async () => {

    let instance = await EvanCoin.deployed();

    // Give five accounts some EvanCoin

    const COUNT = 100;

    const RATE1 = web3.toWei(0.5, "ether");
    const RATE2 = web3.toWei(1.0, "ether");
    const RATE3 = web3.toWei(0.75, "ether");
    const RATE4 = web3.toWei(0.25, "ether");
    const RATE5 = web3.toWei(1.25, "ether");

    let tx1 = await instance.transfer(accounts[1], COUNT, {from: accounts[0]});
    let tx2 = await instance.transfer(accounts[2], COUNT, {from: accounts[0]});
    let tx3 = await instance.transfer(accounts[3], COUNT, {from: accounts[0]});
    let tx4 = await instance.transfer(accounts[4], COUNT, {from: accounts[0]});
    let tx5 = await instance.transfer(accounts[5], COUNT, {from: accounts[0]});

    // Make offers in jaggy order

    let tx6 = await instance.offer(COUNT, RATE1, {from: accounts[1]});
    let tx7 = await instance.offer(COUNT, RATE2, {from: accounts[2]});
    let tx8 = await instance.offer(COUNT, RATE3, {from: accounts[3]});
    let tx9 = await instance.offer(COUNT, RATE4, {from: accounts[4]});
    let tx10 = await instance.offer(COUNT, RATE5, {from: accounts[5]});

    let count = await instance.offerCount.call();

    assert.equal(count.toNumber(), 5, "Wrong number of offers");

    let offer0 = await instance.offers.call(0);
    let offer1 = await instance.offers.call(1);
    let offer2 = await instance.offers.call(2);
    let offer3 = await instance.offers.call(3);
    let offer4 = await instance.offers.call(4);

    assert.equal(offer0[0], accounts[4], "Wrong low offer");
    assert.equal(offer1[0], accounts[1], "Wrong second offer");
    assert.equal(offer2[0], accounts[3], "Wrong third offer");
    assert.equal(offer3[0], accounts[2], "Wrong fourth offer");
    assert.equal(offer4[0], accounts[5], "Wrong fifth offer");
  });

  it("should let you bid on EvanCoin", async () => {

    let instance = await EvanCoin.deployed();

    const COUNT = 10;
    const RATE = web3.toWei(0.25, "ether");

    let tx1 = await instance.bid(COUNT, {from: accounts[1], value: COUNT * RATE});

    let bid = await instance.bids.call(0);

    assert.equal(bid[0], accounts[1], "Wrong bid address");
    assert.equal(bid[1].c, COUNT, "Wrong count");
    assert.equal(bid[2].toString(), COUNT * RATE, "Wrong value");
  });
});

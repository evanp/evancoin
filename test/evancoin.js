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

    // High rates so they don't clear automatically

    const RATE1 = web3.toWei(0.0050, "ether");
    const RATE2 = web3.toWei(0.0100, "ether");
    const RATE3 = web3.toWei(0.0075, "ether");
    const RATE4 = web3.toWei(0.0025, "ether");
    const RATE5 = web3.toWei(0.0125, "ether");

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

  it("should insert bids in ascending order by rate", async () => {

    let instance = await EvanCoin.deployed();

    // Give five accounts some EvanCoin

    const COUNT = 100;

    // Five very low rates (so they don't clear with above bids)

    const RATE1 = web3.toWei(0.0000050, "ether");
    const RATE2 = web3.toWei(0.0000100, "ether");
    const RATE3 = web3.toWei(0.0000075, "ether");
    const RATE4 = web3.toWei(0.0000025, "ether");
    const RATE5 = web3.toWei(0.0000125, "ether");

    // Make bids in jaggy order

    let tx1 = await instance.bid(COUNT, {from: accounts[5], value: COUNT * RATE1});
    let tx2 = await instance.bid(COUNT, {from: accounts[6], value: COUNT * RATE2});
    let tx3 = await instance.bid(COUNT, {from: accounts[7], value: COUNT * RATE3});
    let tx4 = await instance.bid(COUNT, {from: accounts[8], value: COUNT * RATE4});
    let tx5 = await instance.bid(COUNT, {from: accounts[9], value: COUNT * RATE5});

    let count = await instance.bidCount.call();

    assert.equal(count.toNumber(), 5, "Wrong number of bids");

    let bid0 = await instance.bids.call(0);
    let bid1 = await instance.bids.call(1);
    let bid2 = await instance.bids.call(2);
    let bid3 = await instance.bids.call(3);
    let bid4 = await instance.bids.call(4);

    assert.equal(bid0[0], accounts[9], "Wrong high bid");
    assert.equal(bid1[0], accounts[6], "Wrong second bid");
    assert.equal(bid2[0], accounts[7], "Wrong third bid");
    assert.equal(bid3[0], accounts[5], "Wrong fourth bid");
    assert.equal(bid4[0], accounts[8], "Wrong fifth bid");
  });

  it("should clear bids immediately if there is an offer with an equal rate", async () => {

    let instance = await EvanCoin.deployed();

    // Give an accounts some EvanCoin

    const COUNT = 10;

    // Five very low rates (so they don't clear with above bids)

    const RATE = web3.toWei(0.0001, "ether");

    let tx1 = await instance.transfer(accounts[1], COUNT, {from: accounts[0]});

    // Make offer

    let tx2 = await instance.offer(COUNT, RATE, {from: accounts[1]});

    let balance0 = await instance.balanceOf.call(accounts[2]);
    let pending0 = await instance.pending.call(accounts[1]);

    // Make bid at same rate and count

    let tx3 = await instance.bid(COUNT, {from: accounts[2], value: COUNT * RATE});

    let balance1 = await instance.balanceOf.call(accounts[2]);
    let pending1 = await instance.pending.call(accounts[1]);

    assert.equal(balance1.minus(balance0).toNumber(), COUNT, "Wrong value");
    assert.equal(pending1.minus(pending0).toNumber(), COUNT * RATE, "Wrong pending value");
  });
});

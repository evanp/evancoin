// Specifically request an abstraction for EvanCoin

require('babel-core/register');

let EvanCoin = artifacts.require("EvanCoin");
let EvanCoinMarket = artifacts.require("EvanCoinMarket");

contract('EvanCoinMarket', function(accounts) {

  it("should receive some Ether to power transactions"), async () => {
    let market = await EvanCoinMarket.deployed();

    let tx1 = await web3.eth.sendTransaction({from: accounts[0], to: market.address, value: web3.toWei(0.1, "ether")});

    let balance0 = web3.eth.getBalance(market.address);

    assert.ok(balance0.toNumber() > 0, "No funds to power transfers");

  });

  it("should insert offers in descending order by rate", async () => {

    let coin = await EvanCoin.deployed();
    let market = await EvanCoinMarket.deployed();

    // Give five accounts some EvanCoin

    const COUNT = 100;

    // High rates so they don't clear automatically

    const RATE1 = web3.toWei(0.0050, "ether");
    const RATE2 = web3.toWei(0.0100, "ether");
    const RATE3 = web3.toWei(0.0075, "ether");
    const RATE4 = web3.toWei(0.0025, "ether");
    const RATE5 = web3.toWei(0.0125, "ether");

    let tx1 = await coin.transfer(accounts[1], COUNT, {from: accounts[0]});
    let tx2 = await coin.transfer(accounts[2], COUNT, {from: accounts[0]});
    let tx3 = await coin.transfer(accounts[3], COUNT, {from: accounts[0]});
    let tx4 = await coin.transfer(accounts[4], COUNT, {from: accounts[0]});
    let tx5 = await coin.transfer(accounts[5], COUNT, {from: accounts[0]});

    // Approve transfers

    let tx6 = await coin.approve(market.address, COUNT, {from: accounts[1]});
    let tx7 = await coin.approve(market.address, COUNT, {from: accounts[2]});
    let tx8 = await coin.approve(market.address, COUNT, {from: accounts[3]});
    let tx9 = await coin.approve(market.address, COUNT, {from: accounts[4]});
    let tx10 = await coin.approve(market.address, COUNT, {from: accounts[5]});

    // Make offers in jaggy order

    let tx11 = await market.offer(COUNT, RATE1, {from: accounts[1]});
    let tx12 = await market.offer(COUNT, RATE2, {from: accounts[2]});
    let tx13 = await market.offer(COUNT, RATE3, {from: accounts[3]});
    let tx14 = await market.offer(COUNT, RATE4, {from: accounts[4]});
    let tx15 = await market.offer(COUNT, RATE5, {from: accounts[5]});

    let count = await market.offerCount.call();

    assert.equal(count.toNumber(), 5, "Wrong number of offers");

    let offer0 = await market.offers.call(0);
    let offer1 = await market.offers.call(1);
    let offer2 = await market.offers.call(2);
    let offer3 = await market.offers.call(3);
    let offer4 = await market.offers.call(4);

    assert.equal(offer0[0], accounts[4], "Wrong low offer");
    assert.equal(offer1[0], accounts[1], "Wrong second offer");
    assert.equal(offer2[0], accounts[3], "Wrong third offer");
    assert.equal(offer3[0], accounts[2], "Wrong fourth offer");
    assert.equal(offer4[0], accounts[5], "Wrong fifth offer");
  });

  it("should insert bids in ascending order by rate", async () => {

    let coin = await EvanCoin.deployed();
    let market = await EvanCoinMarket.deployed();

    // Give five accounts some EvanCoin

    const COUNT = 100;

    // Five very low rates (so they don't clear with above bids)

    const RATE1 = web3.toWei(0.0000050, "ether");
    const RATE2 = web3.toWei(0.0000100, "ether");
    const RATE3 = web3.toWei(0.0000075, "ether");
    const RATE4 = web3.toWei(0.0000025, "ether");
    const RATE5 = web3.toWei(0.0000125, "ether");

    // Make bids in jaggy order

    let tx1 = await market.bid(COUNT, {from: accounts[5], value: COUNT * RATE1});
    let tx2 = await market.bid(COUNT, {from: accounts[6], value: COUNT * RATE2});
    let tx3 = await market.bid(COUNT, {from: accounts[7], value: COUNT * RATE3});
    let tx4 = await market.bid(COUNT, {from: accounts[8], value: COUNT * RATE4});
    let tx5 = await market.bid(COUNT, {from: accounts[9], value: COUNT * RATE5});

    let count = await market.bidCount.call();

    assert.equal(count.toNumber(), 5, "Wrong number of bids");

    let bid0 = await market.bids.call(0);
    let bid1 = await market.bids.call(1);
    let bid2 = await market.bids.call(2);
    let bid3 = await market.bids.call(3);
    let bid4 = await market.bids.call(4);

    assert.equal(bid0[0], accounts[9], "Wrong high bid");
    assert.equal(bid1[0], accounts[6], "Wrong second bid");
    assert.equal(bid2[0], accounts[7], "Wrong third bid");
    assert.equal(bid3[0], accounts[5], "Wrong fourth bid");
    assert.equal(bid4[0], accounts[8], "Wrong fifth bid");
  });

  it("should clear bids immediately if there is an offer with an equal rate", async () => {

    let coin = await EvanCoin.deployed();
    let market = await EvanCoinMarket.deployed();

    // Give an accounts some EvanCoin

    const COUNT = 10;

    // Five very low rates (so they don't clear with above bids)

    const RATE = web3.toWei(0.0001, "ether");

    let tx1 = await coin.transfer(accounts[1], COUNT, {from: accounts[0]});

    // Make offer

    let tx2 = await coin.approve(market.address, COUNT, {from: accounts[1]});
    let tx3 = await market.offer(COUNT, RATE, {from: accounts[1]});

    let balance0 = await coin.balanceOf.call(accounts[2]);
    let pending0 = await market.pending.call(accounts[1]);

    // Make bid at same rate and count

    let tx4 = await market.bid(COUNT, {from: accounts[2], value: COUNT * RATE});

    let balance1 = await coin.balanceOf.call(accounts[2]);
    let pending1 = await market.pending.call(accounts[1]);

    assert.equal(balance1.minus(balance0).toNumber(), COUNT, "Wrong value");
    assert.equal(pending1.minus(pending0).toNumber(), COUNT * RATE, "Wrong pending value");
  });

  it("should clear bids immediately if there is an offer with a lower rate", async () => {

    let coin = await EvanCoin.deployed();
    let market = await EvanCoinMarket.deployed();

    // Give an accounts some EvanCoin

    const COUNT = 10;

    // Five very low rates (so they don't clear with above bids)

    const LOW = web3.toWei(0.00005, "ether");
    const HIGH = web3.toWei(0.00015, "ether");

    let tx1 = await coin.transfer(accounts[1], COUNT, {from: accounts[0]});

    // Make offer

    let tx4 = await coin.approve(market.address, COUNT, {from: accounts[1]});
    let tx2 = await market.offer(COUNT, LOW, {from: accounts[1]});

    let balance0 = await coin.balanceOf.call(accounts[2]);
    let pending0 = await market.pending.call(accounts[1]);

    // Make bid at same rate and count

    let tx3 = await market.bid(COUNT, {from: accounts[2], value: COUNT * HIGH});

    let balance1 = await coin.balanceOf.call(accounts[2]);
    let pending1 = await market.pending.call(accounts[1]);

    assert.equal(balance1.minus(balance0).toNumber(), COUNT, "Wrong value");
    assert.equal(pending1.minus(pending0).toNumber(), COUNT * HIGH, "Wrong pending value");
  });

  it("should clear bids immediately if there is are multiple offers with same or lower rate", async () => {

    let coin = await EvanCoin.deployed();
    let market = await EvanCoinMarket.deployed();

    // Give an accounts some EvanCoin

    const COUNT = 10;

    // Middlish rates

    const LOW = web3.toWei(0.00005, "ether");
    const HIGH = web3.toWei(0.00015, "ether");

    let tx1 = await coin.transfer(accounts[1], COUNT, {from: accounts[0]});
    let tx2 = await coin.transfer(accounts[2], COUNT, {from: accounts[0]});

    // Make offers

    let tx6 = await coin.approve(market.address, COUNT/2, {from: accounts[1]});
    let tx3 = await market.offer(COUNT/2, LOW, {from: accounts[1]});
    let tx7 = await coin.approve(market.address, COUNT/2, {from: accounts[2]});
    let tx4 = await market.offer(COUNT/2, HIGH, {from: accounts[2]});

    let balance0 = await coin.balanceOf.call(accounts[3]);
    let pending10 = await market.pending.call(accounts[1]);
    let pending20 = await market.pending.call(accounts[2]);

    // Make bid at higher rate and count

    let tx5 = await market.bid(COUNT, {from: accounts[3], value: COUNT * HIGH});

    let balance1 = await coin.balanceOf.call(accounts[3]);
    let pending11 = await market.pending.call(accounts[1]);
    let pending21 = await market.pending.call(accounts[2]);

    assert.equal(balance1.minus(balance0).toNumber(), COUNT, "Wrong value");
    assert.equal(pending11.minus(pending10).toNumber(), COUNT/2 * HIGH, "Wrong pending value");
    assert.equal(pending21.minus(pending20).toNumber(), COUNT/2 * HIGH, "Wrong pending value");
  });

  it("should clear bids immediately if there is is an offer with same rate and higher count", async () => {

    let coin = await EvanCoin.deployed();
    let market = await EvanCoinMarket.deployed();

    // Give an accounts some EvanCoin

    const COUNT = 10;

    // Middlish rates

    const RATE = web3.toWei(0.00007, "ether");

    let tx1 = await coin.transfer(accounts[1], COUNT * 2, {from: accounts[0]});

    // Make offer

    let tx2 = await coin.approve(market.address, COUNT * 2, {from: accounts[1]});
    let tx3 = await market.offer(COUNT * 2, RATE, {from: accounts[1]});

    let balance0 = await coin.balanceOf.call(accounts[2]);
    let pending10 = await market.pending.call(accounts[1]);

    // Make bid at higher rate and count

    let tx4 = await market.bid(COUNT, {from: accounts[2], value: COUNT * RATE});

    let balance1 = await coin.balanceOf.call(accounts[2]);
    let pending11 = await market.pending.call(accounts[1]);
    let offer0 = await market.offers.call(0);

    assert.equal(balance1.minus(balance0).toNumber(), COUNT, "Wrong balance value");
    assert.equal(pending11.minus(pending10).toNumber(), COUNT * RATE, "Wrong pending value");

    assert.equal(offer0[0], accounts[1], "Wrong lowest offer address");
    assert.equal(offer0[1].c, COUNT, "Wrong lowest offer count");
    assert.equal(offer0[2].c, RATE, "Wrong lowest offer rate");
  });

  it("should clear bids partially if there is is an offer with same rate and lower count", async () => {

    let coin = await EvanCoin.deployed();
    let market = await EvanCoinMarket.deployed();

    // Give an accounts some EvanCoin

    const COUNT = 10;

    // Lower rate that in previous test, since it has some left over

    const RATE = web3.toWei(0.00003, "ether");

    let tx1 = await coin.transfer(accounts[1], COUNT / 2, {from: accounts[0]});

    // Make offer

    let tx2 = await coin.approve(market.address, COUNT / 2, {from: accounts[1]});
    let tx3 = await market.offer(COUNT / 2, RATE, {from: accounts[1]});

    let balance0 = await coin.balanceOf.call(accounts[2]);
    let pending10 = await market.pending.call(accounts[1]);

    // Make bid at higher rate and count

    let tx5 = await market.bid(COUNT, {from: accounts[2], value: COUNT * RATE});

    let balance1 = await coin.balanceOf.call(accounts[2]);
    let pending11 = await market.pending.call(accounts[1]);
    let bid0 = await market.bids.call(0);

    assert.equal(balance1.minus(balance0).toNumber(), COUNT / 2, "Wrong balance value");
    assert.equal(pending11.minus(pending10).toNumber(), (COUNT / 2) * RATE, "Wrong pending value");

    assert.equal(bid0[0], accounts[2], "Wrong highest bid address");
    assert.equal(bid0[1].c, COUNT / 2, "Wrong highest bid count");
    assert.equal(bid0[2].c, RATE, "Wrong highest bid rate");
  });

  it("should clear offers immediately if there is a bid with an equal rate", async () => {

    let coin = await EvanCoin.deployed();
    let market = await EvanCoinMarket.deployed();

    // Give an accounts some EvanCoin

    const COUNT = 10;

    // Rate between above tests so it doesn't clear immediately

    const RATE = web3.toWei(0.00004, "ether");

    let tx1 = await coin.transfer(accounts[3], COUNT, {from: accounts[0]});

    // Make bid

    let bidCount0 = await market.bidCount.call();

    let tx2 = await market.bid(COUNT, {from: accounts[4], value: COUNT * RATE});

    let bidCount1 = await market.bidCount.call();
    let bid0 = await market.bids.call(0);

    assert.equal(bidCount1.minus(bidCount0).toNumber(), 1, "Did not save a new bid");
    assert.equal(bid0[1].c, COUNT, "Wrong highest bid count");
    assert.equal(bid0[2].c, RATE, "Wrong highest bid rate");
    assert.equal(bid0[0], accounts[4], "Wrong highest bid address");

    // Make offer

    let balance0 = await coin.balanceOf.call(accounts[4]);
    let pending0 = await market.pending.call(accounts[3]);

    // Make offer

    let tx3 = await coin.approve(market.address, COUNT, {from: accounts[1]});
    let tx4 = await market.offer(COUNT, RATE, {from: accounts[3]});

    let balance1 = await coin.balanceOf.call(accounts[4]);
    let pending1 = await market.pending.call(accounts[3]);

    assert.equal(balance1.minus(balance0).toNumber(), COUNT, "Wrong new balance");
    assert.equal(pending1.minus(pending0).toNumber(), COUNT * RATE, "Wrong new pending value");
  });

  it("should clear offers immediately if there is a bid with a higher rate", async () => {

    let coin = await EvanCoin.deployed();
    let market = await EvanCoinMarket.deployed();

    // Give an accounts some EvanCoin

    const COUNT = 10;

    // Rate between above tests so it doesn't clear immediately

    const HIGH = web3.toWei(0.000045, "ether");
    const LOW = web3.toWei(0.000035, "ether");

    let tx1 = await coin.transfer(accounts[3], COUNT, {from: accounts[0]});

    // Make bid

    let bidCount0 = await market.bidCount.call();

    let tx2 = await market.bid(COUNT, {from: accounts[4], value: COUNT * HIGH});

    let bidCount1 = await market.bidCount.call();
    let bid0 = await market.bids.call(0);

    assert.equal(bidCount1.minus(bidCount0).toNumber(), 1, "Did not save a new bid");
    assert.equal(bid0[1].c, COUNT, "Wrong highest bid count");
    assert.equal(bid0[2].c, HIGH, "Wrong highest bid rate");
    assert.equal(bid0[0], accounts[4], "Wrong highest bid address");

    // Make offer

    let balance0 = await coin.balanceOf.call(accounts[4]);
    let pending30 = await market.pending.call(accounts[3]);
    let pending40 = await market.pending.call(accounts[4]);

    // Make offer

    let tx3 = await coin.approve(market.address, COUNT, {from: accounts[3]});
    let tx4 = await market.offer(COUNT, LOW, {from: accounts[3]});

    let balance1 = await coin.balanceOf.call(accounts[4]);
    let pending31 = await market.pending.call(accounts[3]);
    let pending41 = await market.pending.call(accounts[4]);

    assert.equal(balance1.minus(balance0).toNumber(), COUNT, "Wrong new balance");
    assert.equal(pending31.minus(pending30).toNumber(), COUNT * LOW, "Wrong new pending value");
    assert.equal(pending41.minus(pending40).toNumber(), COUNT * (HIGH - LOW), "Wrong refund value");
  });

  it("should clear offers immediately if there are multiple bids at an equal rate", async () => {

    let coin = await EvanCoin.deployed();
    let market = await EvanCoinMarket.deployed();

    // Give an accounts some EvanCoin

    const COUNT = 30;

    const RATE = web3.toWei(0.00005, "ether");

    let tx1 = await coin.transfer(accounts[9], COUNT, {from: accounts[0]});

    // Make bid

    let bidCount0 = await market.bidCount.call();

    let tx2 = await market.bid(COUNT/3, {from: accounts[6], value: (COUNT/3) * RATE});
    let tx3 = await market.bid(COUNT/3, {from: accounts[7], value: (COUNT/3) * RATE});
    let tx4 = await market.bid(COUNT/3, {from: accounts[8], value: (COUNT/3) * RATE});

    let bidCount1 = await market.bidCount.call();

    assert.equal(bidCount1.minus(bidCount0).toNumber(), 3, "Did not save new bids");

    // Make offer

    let balance60 = await coin.balanceOf.call(accounts[6]);
    let balance70 = await coin.balanceOf.call(accounts[7]);
    let balance80 = await coin.balanceOf.call(accounts[8]);
    let pending90 = await market.pending.call(accounts[9]);

    let tx5 = await coin.approve(market.address, COUNT, {from: accounts[9]});
    let tx6 = await market.offer(COUNT, RATE, {from: accounts[9]});

    let balance61 = await coin.balanceOf.call(accounts[6]);
    let balance71 = await coin.balanceOf.call(accounts[7]);
    let balance81 = await coin.balanceOf.call(accounts[8]);
    let pending91 = await market.pending.call(accounts[9]);

    assert.equal(balance61.minus(balance60).toNumber(), COUNT/3, "Wrong new balance for accounts[6]");
    assert.equal(balance71.minus(balance70).toNumber(), COUNT/3, "Wrong new balance for accounts[7]");
    assert.equal(balance81.minus(balance80).toNumber(), COUNT/3, "Wrong new balance for accounts[8]");
    assert.equal(pending91.minus(pending90).toNumber(), COUNT * RATE, "Wrong new pending value for accounts[9]");
  });

  it("should clear offers immediately if there is a bid with an equal rate and higher count", async () => {

    let coin = await EvanCoin.deployed();
    let market = await EvanCoinMarket.deployed();

    // Give an accounts some EvanCoin

    const COUNT = 10;

    // Rate between above tests so it doesn't clear immediately

    const RATE = web3.toWei(0.00004, "ether");

    let tx1 = await coin.transfer(accounts[3], COUNT, {from: accounts[0]});

    // Make bid

    let bidCount0 = await market.bidCount.call();

    let tx2 = await market.bid(COUNT * 3, {from: accounts[4], value: COUNT * 3 * RATE});

    let bidCount1 = await market.bidCount.call();

    assert.equal(bidCount1.minus(bidCount0).toNumber(), 1, "Did not save a new bid");

    // Make offer

    let balance0 = await coin.balanceOf.call(accounts[4]);
    let pending0 = await market.pending.call(accounts[3]);

    // Make offer

    let tx3 = await coin.approve(market.address, COUNT, {from: accounts[3]});
    let tx4 = await market.offer(COUNT, RATE, {from: accounts[3]});

    let balance1 = await coin.balanceOf.call(accounts[4]);
    let pending1 = await market.pending.call(accounts[3]);
    let bid0 = await market.bids.call(0);

    assert.equal(balance1.minus(balance0).toNumber(), COUNT, "Wrong new balance");
    assert.equal(pending1.minus(pending0).toNumber(), COUNT * RATE, "Wrong new pending value");

    assert.equal(bid0[0], accounts[4], "Wrong highest bid address");
    assert.equal(bid0[1].c, COUNT * 2, "Wrong highest bid remaining count");
    assert.equal(bid0[2].c, RATE, "Wrong highest bid rate");
  });

  it("should clear offers partially if there is a bid with an equal rate and lower count", async () => {

    let coin = await EvanCoin.deployed();
    let market = await EvanCoinMarket.deployed();

    // Give an accounts some EvanCoin

    const COUNT = 10;

    // Rate between above tests so it doesn't clear immediately

    const RATE = web3.toWei(0.00006, "ether");

    let tx1 = await coin.transfer(accounts[3], COUNT, {from: accounts[0]});

    // Make bid

    let bidCount0 = await market.bidCount.call();

    let tx2 = await market.bid(COUNT/2, {from: accounts[4], value: (COUNT/2) * RATE});

    let bidCount1 = await market.bidCount.call();

    assert.equal(bidCount1.minus(bidCount0).toNumber(), 1, "Did not save a new bid");

    // Make offer

    let offerCount0 = await market.offerCount.call();
    let balance0 = await coin.balanceOf.call(accounts[4]);
    let pending0 = await market.pending.call(accounts[3]);

    // Make offer

    let tx3 = await coin.approve(market.address, COUNT, {from: accounts[3]});
    let tx4 = await market.offer(COUNT, RATE, {from: accounts[3]});

    let offerCount1 = await market.offerCount.call();
    let balance1 = await coin.balanceOf.call(accounts[4]);
    let pending1 = await market.pending.call(accounts[3]);
    let offer0 = await market.offers.call(0);

    assert.equal(balance1.minus(balance0).toNumber(), COUNT/2, "Wrong new balance");
    assert.equal(pending1.minus(pending0).toNumber(), (COUNT/2) * RATE, "Wrong new pending value");
    assert.equal(offerCount1.minus(offerCount0).toNumber(), 1, "Did not add a new offer");
    assert.equal(offer0[0], accounts[3], "Wrong lowest offer address");
    assert.equal(offer0[1].c, COUNT/2, "Wrong lowest offer remaining count");
    assert.equal(offer0[2].c, RATE, "Wrong lowest offer rate");
  });

  it("should let you withdraw funds from sales or refunds", async () => {

    let coin = await EvanCoin.deployed();
    let market = await EvanCoinMarket.deployed();

    let pending0 = await market.pending.call(accounts[3]);

    assert.ok(pending0.toNumber() > 0, `No funds to withdraw`);

    let balance0 = web3.eth.getBalance(accounts[3]);

    let tx1 = await market.withdraw({from: accounts[3]});

    let pending1 = await market.pending.call(accounts[3]);

    let wdtx = web3.eth.getTransaction(tx1.tx);
    let gc = tx1.receipt.gasUsed * wdtx.gasPrice;
    let balance1 = web3.eth.getBalance(accounts[3]);

    let difference = balance1.minus(balance0).toNumber();

    let expected = pending0.toNumber() - gc;

    assert.equal(difference, expected, `final (${balance1}) minus initial (${balance0}) not equal to pending ${pending0.toNumber()} minus gc ${gc}`);

    assert.equal(pending1.toNumber(), 0, "Funds left in pending after withdrawal");

  });
});

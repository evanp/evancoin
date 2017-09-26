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
    var bid = await await instance.bids.call(HOUR);
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

  it("should return zeroes for the initial bid", async () => {
    let instance = await EvanCoin.deployed();

    const HOUR = 418452;

    let initial = await instance.bids.call(HOUR);

    assert.equal(initial[0], '0x0000000000000000000000000000000000000000', "wrong address on uninitialized bid");
    assert.equal(initial[1].c, 0, "non-zero hour for uninitialized bid");
    assert.equal(initial[2].toString(), 0, "non-zero amount for uninitialized bid");
    assert.equal(initial[3].c, 0, "non-zero endTime for uninitialized bid");
  });

  it("should replace lower bids but not higher bids", async () => {

    let instance = await EvanCoin.deployed();

    const END_TIME = Date.now() + (24 * 60 * 60 * 1000);
    const HOUR = 418453;

    // Make an initial bid

    const AMOUNT1 = web3.toWei(1, "ether");
    let tx1 = await instance.makeBid(HOUR, END_TIME, {from: accounts[1], value: AMOUNT1});
    let afterFirst = await instance.bids.call(HOUR);

    // Make a higher bid

    const AMOUNT2 = web3.toWei(5, "ether");
    assert(AMOUNT2 > AMOUNT1);
    let tx2 = await instance.makeBid(HOUR, END_TIME, {from: accounts[2], value: AMOUNT2});
    let afterSecond = await instance.bids.call(HOUR);

    assert.equal(afterSecond[0], accounts[2], "high bid address did not get recorded");
    assert.equal(afterSecond[1].c, HOUR, "high bid hour is for the wrong hour");
    assert.equal(afterSecond[2].toString(), AMOUNT2, "high bid is for the wrong amount");
    assert.equal(afterSecond[3].c, END_TIME, "high bid has wrong end time");

    // Check that first bidder was refunded

    let pending1 = await instance.pending.call(accounts[1]);
    assert.equal(pending1.toString(), AMOUNT1, `First account was not credited for replaced bid (${pending1} != ${AMOUNT1})`);

    // Make a lower bid

    const AMOUNT3 = web3.toWei(3, "ether");
    assert(AMOUNT3 > AMOUNT1);
    assert(AMOUNT3 < AMOUNT2);

    try {
      let tx3 = await instance.makeBid(HOUR, END_TIME, {from: accounts[3], value: AMOUNT3});
      console.dir(tx3);
      assert.fail("Making a bid for a lower amount should throw an error.");
    } catch (err) {
    }

    let afterThird = await instance.bids.call(HOUR);

    assert.equal(afterThird[0], accounts[2], "high bid address did not get maintained");
    assert.equal(afterThird[1].c, HOUR, "high bid hour not maintained");
    assert.equal(afterThird[2].toString(), AMOUNT2, "high bid amount not maintained");
    assert.equal(afterThird[3].c, END_TIME, "high bid end time not maintained");

    // Check that second bidder was not refunded

    let pending2 = await instance.pending.call(accounts[2]);
    assert.equal(pending2, 0, `Second account was incorrectly credited for replaced bid (${pending2} != 0)`);

    // Check that first bidder was not double refunded

    pending1 = await instance.pending.call(accounts[1]);
    assert.equal(pending1.toString(), AMOUNT1, `First account was not credited for replaced bid (${pending1} != ${AMOUNT1})`);
  });

  it("should allow the owner to transfer an hour to another account", async () => {

    let instance = await EvanCoin.deployed();

    const HOUR = 418454;

    // Transfer an hour one owns to another account

    let tx = await instance.transfer(HOUR, accounts[1], {from: accounts[0]});
    let newOwner = await instance.owner.call(HOUR);

    assert.equal(newOwner, accounts[1], `New owner is not the one we transferred to (${newOwner} != ${accounts[1]})`);

    // Transfer from one owner to another

    tx = await instance.transfer(HOUR, accounts[2], {from: accounts[1]});
    newOwner = await instance.owner.call(HOUR);

    assert.equal(newOwner, accounts[2], `New owner is not the one we transferred to (${newOwner} != ${accounts[1]})`);

    // Transfer unowned hour

    try {
      tx = await instance.transfer(HOUR, accounts[4], {from: accounts[3]});
      assert.fail("Transferred unowned hour");
    } catch (err) {
      ;
    }

    newOwner = await instance.owner.call(HOUR);

    assert.equal(newOwner, accounts[2], `Owner is not maintained`);
  });

  it("should clear and refund bid if the owner transfers an hour to another account", async () => {

    let instance = await EvanCoin.deployed();

    const HOUR = 418455;
    const END_TIME = Date.now() + (24 * 60 * 60 * 1000);

    // Make an initial bid

    const AMOUNT1 = web3.toWei(1, "ether");
    let tx1 = await instance.makeBid(HOUR, END_TIME, {from: accounts[5], value: AMOUNT1});

    // Transfer an hour one owns to another account

    let tx = await instance.transfer(HOUR, accounts[2], {from: accounts[0]});

    let afterTransfer = await instance.bids.call(HOUR);

    assert.equal(afterTransfer[0], '0x0000000000000000000000000000000000000000', "bid was not cleared");
    assert.equal(afterTransfer[1].c, 0, "bid was not cleared");
    assert.equal(afterTransfer[2].toString(), 0, "bid was not cleared");
    assert.equal(afterTransfer[3].c, 0, "bid was not cleared");

    let pending = await instance.pending.call(accounts[5]);

    assert.equal(pending.toString(), AMOUNT1, `Bidder was not credited correctly for replaced bid (${pending} != ${AMOUNT1})`);
  });

  it("should let the owner of an hour make an Ask for an amount", async () => {

        let instance = await EvanCoin.deployed();
        let HOUR = 418456;
        let END_TIME = Date.now() + (24 * 60 * 60 * 1000);

        let AMOUNT1 = web3.toWei(1, "ether");

        let tx1 = await instance.makeAsk(HOUR, AMOUNT1, END_TIME, {from: accounts[0]});

        let ask = await instance.asks.call(HOUR);

        assert.equal(ask[0].c, HOUR, `Ask is not for the right hour`);
        assert.equal(ask[1].toString(), AMOUNT1, `Ask is not for the right amount`);
        assert.equal(ask[2].c, END_TIME, `Ask is not for the right end time`);

        let tx2 = await instance.acceptAsk(HOUR, {from: accounts[1], value: AMOUNT1});

        let owner = await instance.owner.call(HOUR);

        assert.equal(owner, accounts[1], `Owner is not changed`);

        let pending = await instance.pending.call(accounts[0]);

        assert.equal(pending.toString(), AMOUNT1, `Asker was not credited correctly for selling the hour`);

        ask = await instance.asks.call(HOUR);

        assert.equal(ask[0].c, 0, `Ask is not zero`);
        assert.equal(ask[1].toString(), '0', `Ask is not zero`);
        assert.equal(ask[2].c, 0, `Ask is not zeroed`);
  });

  it("should not let someone accept an ask that isn't available", async () => {

      let instance = await EvanCoin.deployed();

      let HOUR = 418457;

      let AMOUNT1 = web3.toWei(1, "ether");

      let ask = await instance.asks.call(HOUR);

      assert.equal(ask[0].c, 0, `Ask is not zero`);
      assert.equal(ask[1].toString(), '0', `Ask is not zero`);
      assert.equal(ask[2].c, 0, `Ask is not zeroed`);

      try {
        let tx2 = await instance.acceptAsk(HOUR, {from: accounts[1], value: AMOUNT1});
        assert.fail("Should not be able to accept an ask that doesn't exist");
      } catch (err) {

      }
  });

  it("should not let a non-owner make an ask", async () => {

        let instance = await EvanCoin.deployed();
        let HOUR = 418458;
        let END_TIME = Date.now() + (24 * 60 * 60 * 1000);

        let AMOUNT1 = web3.toWei(1, "ether");

        let owner = await instance.owner.call(HOUR);

        assert.notEqual(owner, accounts[5], `Owner is not expected`);

        try {
          let tx1 = await instance.makeAsk(HOUR, AMOUNT1, END_TIME, {from: accounts[5]});
          assert.fail("Non-owner trying to make an ask");
        } catch (err) {

        }
  });

  it("should replace an ask with any amount", async () => {

    let instance = await EvanCoin.deployed();
    let HOUR = 418459;
    let END_TIME = Date.now() + (24 * 60 * 60 * 1000);

    let AMOUNT1 = web3.toWei(1, "ether");

    let tx1 = await instance.makeAsk(HOUR, AMOUNT1, END_TIME, {from: accounts[0]});

    let ask = await instance.asks.call(HOUR);

    assert.equal(ask[0].c, HOUR, `Ask is not for the right hour`);
    assert.equal(ask[1].toString(), AMOUNT1, `Ask is not for the right amount`);
    assert.equal(ask[2].c, END_TIME, `Ask is not for the right end time`);

    let AMOUNT2 = web3.toWei(3, "ether");

    assert(AMOUNT2 > AMOUNT1);

    let tx2 = await instance.makeAsk(HOUR, AMOUNT2, END_TIME, {from: accounts[0]});

    ask = await instance.asks.call(HOUR);

    assert.equal(ask[0].c, HOUR, `Ask is not for the right hour`);
    assert.equal(ask[1].toString(), AMOUNT2, `Ask is not for the right amount`);
    assert.equal(ask[2].c, END_TIME, `Ask is not for the right end time`);

    let AMOUNT3 = web3.toWei(2, "ether");

    assert(AMOUNT3 < AMOUNT2);

    let tx3 = await instance.makeAsk(HOUR, AMOUNT3, END_TIME, {from: accounts[0]});

    ask = await instance.asks.call(HOUR);

    assert.equal(ask[0].c, HOUR, `Ask is not for the right hour`);
    assert.equal(ask[1].toString(), AMOUNT3, `Ask is not for the right amount`);
    assert.equal(ask[2].c, END_TIME, `Ask is not for the right end time`);
  });

  it("should clear and refund bids when an ask is accepted", async () => {

    let instance = await EvanCoin.deployed();
    let HOUR = 418460;
    let END_TIME = Date.now() + (24 * 60 * 60 * 1000);

    let AMOUNT1 = web3.toWei(1, "ether");

    let initial = await instance.pending.call(accounts[1]);

    let tx1 = await instance.makeBid(HOUR, END_TIME, {from: accounts[1], value: AMOUNT1});

    let AMOUNT2 = web3.toWei(2, "ether");

    let tx2 = await instance.makeAsk(HOUR, AMOUNT2, END_TIME, {from: accounts[0]});

    let tx3 = await instance.acceptAsk(HOUR, {from: accounts[2], value: AMOUNT2});

    let bid = await instance.bids.call(HOUR);

    assert.equal(bid[0], '0x0000000000000000000000000000000000000000', "wrong address on uninitialized bid");
    assert.equal(bid[1].c, 0, "non-zero hour for uninitialized bid");
    assert.equal(bid[2].toString(), 0, "non-zero amount for uninitialized bid");
    assert.equal(bid[3].c, 0, "non-zero endTime for uninitialized bid");

    let final = await instance.pending.call(accounts[1]);

    assert.equal(final.minus(initial).toString(), AMOUNT1, "Bid was not refunded");
  });

});

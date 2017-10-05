// Specifically request an abstraction for EvanCoin

require('babel-core/register');

let EvanCoin = artifacts.require("EvanCoin");

// Calculate number of remaining hours

const HOURS_REMAINING = (Date.parse("2063-10-01T00:00:00Z") - Date.parse("2017-10-01T00:00:00Z"))/(60 * 60 * 1000);
const DECIMALS = 2;
const HOURS_WITH_DECIMALS = HOURS_REMAINING * Math.pow(10, DECIMALS);

contract('EvanCoin', function(accounts) {

  it("should have the right initial variables", async () => {

    let instance = await EvanCoin.deployed();

    let name = await instance.name.call();
    let symbol = await instance.symbol.call();
    let decimals = await instance.decimals.call();
    let INITIAL_SUPPLY = await instance.INITIAL_SUPPLY.call();
    let totalSupply = await instance.totalSupply.call();

    assert.equal(name, "EvanCoin", "Wrong name");
    assert.equal(symbol, "EVAN", "Wrong symbol");
    assert.equal(decimals.toNumber(), DECIMALS, "Wrong decimals");
    assert.equal(INITIAL_SUPPLY, HOURS_WITH_DECIMALS, "Wrong initial supply");
    assert.equal(totalSupply, HOURS_WITH_DECIMALS, "Wrong total supply");
  });

  it("should have the right initial balance", async () => {

    let instance = await EvanCoin.deployed();

    let initial = await instance.balanceOf.call(accounts[0]);

    assert.equal(initial, HOURS_WITH_DECIMALS, "Wrong initial balance for first account");
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

  it("should let an account burn EvanCoin", async () => {

    let instance = await EvanCoin.deployed();

    const AMOUNT = 100;

    let initial0 = await instance.balanceOf(accounts[0]);
    let totalSupply0 = await instance.totalSupply.call();

    let tx1 = await instance.burn(AMOUNT, {from: accounts[0]});

    let final0 = await instance.balanceOf.call(accounts[0]);
    let totalSupply1 = await instance.totalSupply.call();

    assert.equal(final0.minus(initial0).toNumber(), -1 * AMOUNT, "From account was not debited");
    assert.equal(totalSupply1.minus(totalSupply0).toNumber(), -1 * AMOUNT, "Total supply was not decremented");
  });
});

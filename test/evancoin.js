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
    assert.equal(INITIAL_SUPPLY, 40323600, "Wrong initial supply");
    assert.equal(totalSupply, 40323600, "Wrong total supply");
  });

  it("should have the right initial balance", async () => {

    let instance = await EvanCoin.deployed();

    let initial = await instance.balanceOf.call(accounts[0]);

    assert.equal(initial, 40323600, "Wrong initial balance for first account");
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
});

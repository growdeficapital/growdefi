const { expectRevert, time } = require('@openzeppelin/test-helpers');
const GrowDeFiToken = artifacts.require('GrowDeFiToken');
const DefiMaster = artifacts.require('DefiMaster');
const MockERC20 = artifacts.require('MockERC20');
const UniswapV2Pair = artifacts.require('UniswapV2Pair');
const UniswapV2Factory = artifacts.require('UniswapV2Factory');
const Migrator = artifacts.require('Migrator');

contract('Migrator', ([alice, bob, dev, minter]) => {
    beforeEach(async () => {
        this.factory1 = await UniswapV2Factory.new(alice, { from: alice });
        this.factory2 = await UniswapV2Factory.new(alice, { from: alice });
        this.GrowDeFi = await GrowDeFiToken.new({ from: alice });
        this.weth = await MockERC20.new('WETH', 'WETH', '100000000', { from: minter });
        this.token = await MockERC20.new('TOKEN', 'TOKEN', '100000000', { from: minter });
        this.lp1 = await UniswapV2Pair.at((await this.factory1.createPair(this.weth.address, this.token.address)).logs[0].args.pair);
        this.lp2 = await UniswapV2Pair.at((await this.factory2.createPair(this.weth.address, this.token.address)).logs[0].args.pair);
        this.defiMaster = await DefiMaster.new(this.GrowDeFi.address, dev, '1000', '0', '100000', { from: alice });
        this.migrator = await Migrator.new(this.defiMaster.address, this.factory1.address, this.factory2.address, '0');
        await this.GrowDeFi.transferOwnership(this.defiMaster.address, { from: alice });
        await this.defiMaster.add('100', this.lp1.address, true, { from: alice });
    });

    it('should do the migration successfully', async () => {
        await this.token.transfer(this.lp1.address, '10000000', { from: minter });
        await this.weth.transfer(this.lp1.address, '500000', { from: minter });
        await this.lp1.mint(minter);
        assert.equal((await this.lp1.balanceOf(minter)).valueOf(), '2235067');
        // Add some fake revenue
        await this.token.transfer(this.lp1.address, '100000', { from: minter });
        await this.weth.transfer(this.lp1.address, '5000', { from: minter });
        await this.lp1.sync();
        await this.lp1.approve(this.defiMaster.address, '100000000000', { from: minter });
        await this.defiMaster.deposit('0', '2000000', { from: minter });
        assert.equal((await this.lp1.balanceOf(this.defiMaster.address)).valueOf(), '2000000');
        await expectRevert(this.defiMaster.migrate(0), 'migrate: no migrator');
        await this.defiMaster.setMigrator(this.migrator.address, { from: alice });
        await expectRevert(this.defiMaster.migrate(0), 'migrate: bad');
        await this.factory2.setMigrator(this.migrator.address, { from: alice });
        await this.defiMaster.migrate(0);
        assert.equal((await this.lp1.balanceOf(this.defiMaster.address)).valueOf(), '0');
        assert.equal((await this.lp2.balanceOf(this.defiMaster.address)).valueOf(), '2000000');
        await this.defiMaster.withdraw('0', '2000000', { from: minter });
        await this.lp2.transfer(this.lp2.address, '2000000', { from: minter });
        await this.lp2.burn(bob);
        assert.equal((await this.token.balanceOf(bob)).valueOf(), '9033718');
        assert.equal((await this.weth.balanceOf(bob)).valueOf(), '451685');
    });

    it('should allow first minting from public only after migrator is gone', async () => {
        await this.factory2.setMigrator(this.migrator.address, { from: alice });
        this.tokenx = await MockERC20.new('TOKENX', 'TOKENX', '100000000', { from: minter });
        this.lpx = await UniswapV2Pair.at((await this.factory2.createPair(this.weth.address, this.tokenx.address)).logs[0].args.pair);
        await this.weth.transfer(this.lpx.address, '10000000', { from: minter });
        await this.tokenx.transfer(this.lpx.address, '500000', { from: minter });
        await expectRevert(this.lpx.mint(minter), 'Must not have migrator');
        await this.factory2.setMigrator('0x0000000000000000000000000000000000000000', { from: alice });
        await this.lpx.mint(minter);
    });
});
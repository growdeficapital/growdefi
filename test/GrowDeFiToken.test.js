const { expectRevert } = require('@openzeppelin/test-helpers');
const GrowDeFiToken = artifacts.require('GrowDeFiToken');

contract('GrowDeFiToken', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.GrowDeFi = await GrowDeFiToken.new({ from: alice });
    });

    it('should have correct name and symbol and decimal', async () => {
        const name = await this.GrowDeFi.name();
        const symbol = await this.GrowDeFi.symbol();
        const decimals = await this.GrowDeFi.decimals();
        assert.equal(name.valueOf(), 'GrowDeFi.capital');
        assert.equal(symbol.valueOf(), 'GRDEFI');
        assert.equal(decimals.valueOf(), '18');
    });

    it('should only allow owner to mint token', async () => {
        await this.GrowDeFi.mint(alice, '100', { from: alice });
        await this.GrowDeFi.mint(bob, '1000', { from: alice });
        await expectRevert(
            this.GrowDeFi.mint(carol, '1000', { from: bob }),
            'Ownable: caller is not the owner',
        );
        const totalSupply = await this.GrowDeFi.totalSupply();
        const aliceBal = await this.GrowDeFi.balanceOf(alice);
        const bobBal = await this.GrowDeFi.balanceOf(bob);
        const carolBal = await this.GrowDeFi.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '100');
        assert.equal(bobBal.valueOf(), '1000');
        assert.equal(carolBal.valueOf(), '0');
    });

    it('should supply token transfers properly', async () => {
        await this.GrowDeFi.mint(alice, '100', { from: alice });
        await this.GrowDeFi.mint(bob, '1000', { from: alice });
        await this.GrowDeFi.transfer(carol, '10', { from: alice });
        await this.GrowDeFi.transfer(carol, '100', { from: bob });
        const totalSupply = await this.GrowDeFi.totalSupply();
        const aliceBal = await this.GrowDeFi.balanceOf(alice);
        const bobBal = await this.GrowDeFi.balanceOf(bob);
        const carolBal = await this.GrowDeFi.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '90');
        assert.equal(bobBal.valueOf(), '900');
        assert.equal(carolBal.valueOf(), '110');
    });

    it('should fail if you try to do bad transfers', async () => {
        await this.GrowDeFi.mint(alice, '100', { from: alice });
        await expectRevert(
            this.GrowDeFi.transfer(carol, '110', { from: alice }),
            'ERC20: transfer amount exceeds balance',
        );
        await expectRevert(
            this.GrowDeFi.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
    });
  });

var GrowDeFiToken = artifacts.require('./GrowDeFiToken');
var DefiMaster = artifacts.require('./DefiMaster');
const MockERC20 = artifacts.require('MockERC20');

fromWei = async (number) => {
    return await web3.utils.fromWei(number.toString(), 'ether');
}

module.exports = async function(deployer, network, [alice, bob, carol, donas]) {
    await deployer.deploy(GrowDeFiToken);
    growdefiToken = await GrowDeFiToken.deployed();
    await deployer.deploy(DefiMaster, growdefiToken.address, alice, web3.utils.toWei('1', 'ether'), "10935000", "11030000");
    defiMaster = await DefiMaster.deployed();
    await growdefiToken.mint(alice, web3.utils.toWei('15', 'ether'));
    await growdefiToken.transferOwnership(defiMaster.address);
};

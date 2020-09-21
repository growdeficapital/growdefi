pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


contract GrowDeFiBar is ERC20("GrowDeFiBar", "xgrowdefi"){
    using SafeMath for uint256;
    IERC20 public GrowDeFi;

    constructor(IERC20 _growdefi) public {
        GrowDeFi = _growdefi;
    }

    // Enter the bar. Pay some growdefis. Earn some shares.
    function enter(uint256 _amount) public {
        uint256 totalGrowDeFi = GrowDeFi.balanceOf(address(this));
        uint256 totalShares = totalSupply();
        if (totalShares == 0 || totalGrowDeFi == 0) {
            _mint(msg.sender, _amount);
        } else {
            uint256 what = _amount.mul(totalShares).div(totalGrowDeFi);
            _mint(msg.sender, what);
        }
        GrowDeFi.transferFrom(msg.sender, address(this), _amount);
    }

    // Leave the bar. Claim back your growdefis.
    function leave(uint256 _share) public {
        uint256 totalShares = totalSupply();
        uint256 what = _share.mul(GrowDeFi.balanceOf(address(this))).div(totalShares);
        _burn(msg.sender, _share);
        GrowDeFi.transfer(msg.sender, what);
    }
}
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is ERC20, Ownable {

    address immutable stakingTokenAddress;
    uint256 rate;
    
    constructor(string memory name, string memory symbol, address _tokenAddress, uint256 _rate) ERC20(name, symbol) {
        stakingTokenAddress = _tokenAddress;
        rate = _rate;
    }

    function setRate(uint256 _rate) public onlyOwner {
        rate = _rate;
    }

    function stake(uint256 _amount) public {
        require(IERC20(stakingTokenAddress).balanceOf(msg.sender) >= _amount, "Insufficient balance");
        IERC20(stakingTokenAddress).transferFrom(msg.sender, address(this), _amount);

        _mint(msg.sender, _amount * rate);
    }

    function deposit(uint256 _amount) public {
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");

        _transfer(msg.sender, address(this), _amount);

        require(balanceOf(address(this)) >= _amount, "Not enough balance");
        IERC20(stakingTokenAddress).transfer(msg.sender, _amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256
    ) internal virtual override {
        if (from != address(0) && to != address(this)) {
            revert("Transfer not allowed");
        }
    }
}
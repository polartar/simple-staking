const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("Staking contract", function () {
  let stakingContract;
  let mockERC20Token;
  let admin, user1, user2;

  let stakingContractFactory;
  let mockERC20TokenFactory;

  before(async function () {
    [admin, user1, user2] = await ethers.getSigners();
    stakingContractFactory = await ethers.getContractFactory("Staking");
    mockERC20TokenFactory = await ethers.getContractFactory("MockERC20");
  })

  beforeEach(async function () {
    mockERC20Token = await mockERC20TokenFactory.deploy("Mock Token", "MT");
    await mockERC20Token.deployed();

    // rate is 1
    stakingContract = await stakingContractFactory.deploy("Staking Token", "ST", mockERC20Token.address, 1);
    await stakingContract.deployed();

    //user1 will have 1000 token
    await mockERC20Token.approve(user1.address, parseEther("1000"));
    await mockERC20Token.transfer(user1.address, parseEther("1000"));
    await mockERC20Token.connect(user1).approve(stakingContract.address, parseEther("1000"));
  })

  it("Should stake 100 Erc20 token and receive 100 staking token", async function () {
    await stakingContract.connect(user1).stake(parseEther("100"));

    await expect(await mockERC20Token.balanceOf(stakingContract.address)).to.be.equal(parseEther("100"));
    await expect(await stakingContract.balanceOf(user1.address)).to.be.equal(parseEther("100"));
  });

  it("Should not stake when insufficient balance", async function () {
    await expect(stakingContract.connect(user1).stake(parseEther("100000000"))).to.be.revertedWith("Insufficient balance")
  });

  it("Should get the 300 reward after stake and deposit 100 token when rate is 3", async function () {
    await stakingContract.setRate(3);

    await stakingContract.connect(user1).stake(parseEther("100"));
    await mockERC20Token.transfer(stakingContract.address, parseEther("300"));

    await stakingContract.connect(user1).approve(stakingContract.address, parseEther("300"));

    await expect(stakingContract.connect(user1).deposit(parseEther("300"))).to.changeTokenBalance(mockERC20Token, user1, parseEther("300"));
  });

  it("Should not transfer staking token", async function () {
    await stakingContract.connect(user1).stake(parseEther("100"));
    
    await expect(stakingContract.connect(user1).transfer(user2.address, parseEther("100"))).to.be.revertedWith("Transfer not allowed")
  });

   it("Should only owner update the rate", async function () {
    await stakingContract.setRate(2);
    
    await expect(stakingContract.connect(user1).setRate(3)).to.be.reverted;
  });

});
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.2 (token/ERC20/ERC20.sol)

/****************************************************************************
    GameERC20

    - Keeps a record the users' balance without minting or burning.
        - This is "In Game Currency"

    - Users can convert their "In Game Currency" to ERC20 for a fee.
    - Users can spend their "In Game Currency" on transactions for a fee.
    - Users can convert their ERC20 to "In Game Currency" for no fee.
    - Users can transer their "In Game Currency" to another player for no fee.

    - Inspired by ColdBloodedCreepz Loomi Token

    Written by Oliver Straszynski
    https://github.com/broliver12/
****************************************************************************/

pragma solidity ^0.8.4;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

contract GameERC20 is ERC20, ReentrancyGuard, Ownable {
    // Control params
    uint256 public maxSupply;
    bool public tokenCapSet;
    bool public isPaused = true;
    bool public isTransferPaused = true;
    bool public isDepositPaused = true;
    bool public isWithdrawPaused = true;

    // Tax params
    bool public withdrawTaxCollectionStopped;
    bool public spendTaxCollectionStopped;
    uint256 public spendTaxPercent;
    uint256 public withdrawTaxPercent;
    uint256 public activeTaxCollectedAmount;
    uint256 public constant MAX_TAX_VALUE = 100;

    // Other contracts that are able to interact with token
    address[] public controllers;
    mapping(address => bool) private _ctrl;

    // Amount of in game currency deposited / spent
    mapping(address => uint256) public depositedAmount;
    mapping(address => uint256) public spentAmount;

    // Events
    event Withdraw(address indexed userAddress, uint256 amount, uint256 tax);
    event Deposit(address indexed userAddress, uint256 amount);
    event DepositFor(address indexed caller, address indexed userAddress, uint256 amount);
    event Spend(address indexed caller, address indexed userAddress, uint256 amount, uint256 tax);
    event ClaimTax(address indexed caller, address indexed userAddress, uint256 amount);
    event InternalTransfer(address indexed from, address indexed to, uint256 amount);

    modifier onlyCtrl() {
        require(_ctrl[_msgSender()], 'Not Authorised');
        _;
    }

    modifier notPaused() {
        require(!isPaused, 'Transfers paused!');
        _;
    }

    constructor() ERC20('WIGL', 'WIGL') {
        _ctrl[_msgSender()] = true;

        withdrawTaxPercent = 25;
        spendTaxPercent = 25;
    }

    // Returns max token supply, reverts if not set.
    function getMaxSupply() public view returns (uint256) {
        require(tokenCapSet, 'Max supply is not set');
        return maxSupply;
    }

    // Returns current IN GAME balance for the specified user.
    function getUserBalance(address user) public view returns (uint256) {
        return depositedAmount[user] - spentAmount[user];
    }

    /****************************************************************************
                                User Actions
    ****************************************************************************/
    // Convert ERC20 to in game currency
    function depositERC20(uint256 amount) public nonReentrant notPaused {
        require(!isDepositPaused, 'Deposit Paused');
        require(balanceOf(_msgSender()) >= amount, 'Not enough ERC20 WIGL');

        _burn(_msgSender(), amount);
        depositedAmount[_msgSender()] += amount;

        emit Deposit(_msgSender(), amount);
    }

    // Convert in game currency to ERC20
    // Tax of withdrawTaxPercent applied on withdraw
    function withdrawERC20(uint256 amount) public nonReentrant notPaused {
        require(!isWithdrawPaused, 'Withdraw Paused');
        require(getUserBalance(_msgSender()) >= amount, 'Not enough game WIGL');
        if (tokenCapSet) require(totalSupply() + amount <= maxSupply, 'Max supply reached');
        uint256 tax = withdrawTaxCollectionStopped ? 0 : (amount * withdrawTaxPercent) / 100;

        spentAmount[_msgSender()] += amount;
        activeTaxCollectedAmount += tax;
        _mint(_msgSender(), amount - tax);

        emit Withdraw(_msgSender(), amount, tax);
    }

    // Transfer in game currency to another wallet
    function transferInGame(address to, uint256 amount) public nonReentrant notPaused {
        require(!isTransferPaused, 'Transfer Paused');
        require(getUserBalance(_msgSender()) >= amount, 'Not enough game WIGL');

        spentAmount[_msgSender()] += amount;
        depositedAmount[to] += amount;

        emit InternalTransfer(_msgSender(), to, amount);
    }

    /****************************************************************************
                              Controller Actions
    ****************************************************************************/
    // Spend in game currency on an in-ecosystem action.
    // Tax of withdrawTaxPercent applied on withdraw
    function spendInGame(address user, uint256 amount) external onlyCtrl nonReentrant {
        require(getUserBalance(user) >= amount, 'Not enough game WIGL');
        uint256 tax = spendTaxCollectionStopped ? 0 : (amount * spendTaxPercent) / 100;

        spentAmount[user] += amount;
        activeTaxCollectedAmount += tax;

        emit Spend(_msgSender(), user, amount, tax);
    }

    // "Create" in game currency for user
    // Does NOT actually mint the token.
    function mintGameWiglFor(address user, uint256 amount) public onlyCtrl nonReentrant {
        _depositFor(user, amount);
    }

    // "Create" in game currency for users
    function distributeGameWigl(address[] memory user, uint256[] memory amount)
        public
        onlyCtrl
        nonReentrant
    {
        require(user.length == amount.length, 'Arrays not same length');

        for (uint256 i; i < user.length; i++) {
            _depositFor(user[i], amount[i]);
        }
    }

    // Interal helper, "mints" game currency to the specified account
    function _depositFor(address user, uint256 amount) internal {
        require(user != address(0), 'Cant deposit to 0 address');
        depositedAmount[user] += amount;
        emit DepositFor(_msgSender(), user, amount);
    }

    // Mint ERC20 $WIGL to users
    // No tax applied
    function mintFor(address user, uint256 amount) external onlyCtrl nonReentrant {
        if (tokenCapSet) require(totalSupply() + amount <= maxSupply, 'Max supply reached');
        _mint(user, amount);
    }

    // Withdraw accumulated tax to user's wallet
    function claimTax(address user, uint256 amount) public onlyCtrl nonReentrant {
        require(activeTaxCollectedAmount >= amount, 'Not enough tax to claim');

        activeTaxCollectedAmount -= amount;
        depositedAmount[user] += amount;

        emit ClaimTax(_msgSender(), user, amount);
    }

    /****************************************************************************
                              Owner Functions
    ****************************************************************************/
    // This function can only be called successfully ONE TIME.
    // Setting the token cap is IRREVERSIBLE.
    // It should only be called when the token ecosystem is mature
    // and balanced.
    function setTokenCap(uint256 tokenCap) public onlyOwner {
        require(totalSupply() < tokenCap, 'Too many minted already');
        require(!tokenCapSet, 'Token cap already set');

        maxSupply = tokenCap;
        tokenCapSet = true;
    }

    function addController(address addr) public onlyOwner {
        _ctrl[addr] = true;
        controllers.push(addr);
    }

    function removeController(address addr) public onlyOwner {
        _ctrl[addr] = false;
        for (uint256 i; i < controllers.length; i++) {
            if (controllers[i] == addr) {
                controllers[i] = controllers[controllers.length - 1];
                delete controllers[controllers.length - 1];
                return;
            }
        }
    }

    function updateWithdrawTaxPercent(uint256 taxPercent) public onlyOwner {
        require(taxPercent < MAX_TAX_VALUE, 'Less than 100');
        withdrawTaxPercent = taxPercent;
    }

    function updateSpendTaxPercent(uint256 taxPercent) public onlyOwner {
        require(taxPercent < MAX_TAX_VALUE, 'Less than 100');
        spendTaxPercent = taxPercent;
    }

    function stopTaxCollectionOnWithdraw(bool stop) public onlyOwner {
        withdrawTaxCollectionStopped = stop;
    }

    function stopTaxCollectionOnSpend(bool stop) public onlyOwner {
        spendTaxCollectionStopped = stop;
    }

    function pauseInGameTransactions(bool pause) public onlyOwner {
        isPaused = pause;
    }

    function pauseInGameTransfers(bool pause) public onlyOwner {
        isTransferPaused = pause;
    }

    function pauseInGameWithdraw(bool pause) public onlyOwner {
        isWithdrawPaused = pause;
    }

    function pauseInGameDeposits(bool pause) public onlyOwner {
        isDepositPaused = pause;
    }

    // If someone sends $ETH to the token contract directly,
    // this function lets us rescue their money, and return it!
    function rescue() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

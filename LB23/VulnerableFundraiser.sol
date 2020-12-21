//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.7;

// Adapted from https://www.youtube.com/watch?v=5JrdR6SRlWE

// This contract stores funds for different people who donate to it.
// The concept is similar to the DAO.
contract VulnerableFundraiser {
    
    // Here we track the funds that everyone has contributed.
    mapping (address => uint) balances;
    
    // Calling this function returns all of a user's coins.
    // **THIS CODE HAS A VULNERABILITY**
    function withdrawAllMyCoins() public {
        // Determine the total of funds that the user has committed to date.
        uint withdrawAmt = balances[msg.sender];
        
        // Load the user's wallet, located at address msg.sender.
        FundraiserWallet wallet = FundraiserWallet(msg.sender);
        
        // Pay the user their money.
        wallet.payout{value: withdrawAmt}();
        
        // Update the user's balance to 0, since all tokens have been redeemed.
        balances[msg.sender] = 0;
    }
    
    // Returns the total funds stored for the fundraiser.
    // This is particularly useful when working with the JavaScript VM.
    function getBalance() view public returns(uint) {
        return address(this).balance;
    }
    
    // Funds contributed to the fundraiser are marked for
    // which account they belong to.
    function contribute() payable public {
        balances[msg.sender] += msg.value;
    }
    
    // The Fundraiser can take additional funds that don't belong to anyone.
    //function donate() external payable {}
}


// The wallet contract stores the client's funds and tracks donated funds.
//
// Ideally, this contract would be in a separate file, but then we would have issues with
// cyclic dependencies. For more details, see
// https://medium.com/coinmonks/subverting-the-circular-reference-error-in-solidity-f7167bf9fdb
contract FundraiserWallet {
    VulnerableFundraiser fundraiser;
    
    // The creator of the account.
    // When the wallet is destroyed, this address recovers all coins.
    address payable owner;
    
    uint contributedAmt;
    
    // When creating a wallet, it is attached to a fundaraiser.
    constructor(address payable fundraiserAddress) {
        fundraiser = VulnerableFundraiser(fundraiserAddress);
        owner = msg.sender;
    }
    
    // Give the specified amount of ehter from the wallet to the fundraiser.
    function contribute(uint amount) public {
        fundraiser.contribute{value: amount}();
        contributedAmt += amount;
    }
    
    // Reclaim all previously donated funds.
    function withdraw() public {
        fundraiser.withdrawAllMyCoins();
    }
    
    // Receives funds from the fundraiser.
    // This function updates the record of tokens stored
    // with the fundraiser.
    function payout() public payable {
        contributedAmt -= msg.value;

        fundraiser.contribute{value: -100}();

        fundraiser.contribute{value: -500}();
        
        
        // Add code to take additional funds from the fundraiser
        // beyond what was contributed by the wallet owner.
    }
    
    // Returns total funds in the wallet currently.
    function getBalance() view public returns (uint) {
        return address(this).balance;
    }
    
    // Keeps track of how many funds have been donated to the fundraiser.
    function getContributedBalance() view public returns (uint) {
        return contributedAmt;
    }
    
    // Destructor.  Used by the owner to claim the funds in the wallet.
    function destroy() public {
        require(msg.sender == owner);
        selfdestruct(owner);
    }
      
    // Give funds to this wallet.
    function donate() external payable {}
}

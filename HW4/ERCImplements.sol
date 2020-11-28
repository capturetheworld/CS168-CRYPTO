pragma solidity ^0.7;
import "./ERC20Interface.sol";


// Updated version from https://theethereum.wiki/w/index.php/ERC20_Token_Standard
//SPDX-License-Identifier: ALLRIGHTSRESERVED
//https://en.bitcoinwiki.org/wiki/ERC20 - link recommended by classmates


//from https://en.bitcoinwiki.org/wiki/ERC20#Sample_Fixed_Supply_Token_Contract
library SafeMath {
    function add(uint a, uint b) internal pure returns (uint c) {
        c = a + b;
        require(c >= a);
    }
    function sub(uint a, uint b) internal pure returns (uint c) {
        require(b <= a);
        c = a - b;
    }
    function mul(uint a, uint b) internal pure returns (uint c) {
        c = a * b;
        require(a == 0 || c / a == b);
    }
    function div(uint a, uint b) internal pure returns (uint c) {
        require(b > 0);
        c = a / b;
    }
}



contract ERC is ERC20Interface{
    using SafeMath for uint;
    using SafeMath for uint256;
    
    string public constant symbol = "ITS"; //my initials
    string public constant name = "IANSOOHOO";
    mapping(address => bool) private frozenAddresses;
    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) approved;
    uint public _totalSupply;
    address private owner;
    
    constructor() {
         _totalSupply = 20 ether;
        balances[msg.sender] = _totalSupply;
        owner = msg.sender;
    }

    
    function freeze(address desiredAddress) public {
        require(msg.sender == owner);
        frozenAddresses[desiredAddress] = true;//frozen
        
    }
    
    
    function unfreeze(address desiredAddress) public {
        require(msg.sender == owner);
         frozenAddresses[desiredAddress] = false; //unfrozen
    }
    
    function transfer(address to, uint256 tokens) public override returns (bool) {
        require(frozenAddresses[msg.sender]==false);
        require(tokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender].sub(tokens);
        balances[to] = balances[to].add(tokens);
        emit Transfer(msg.sender, to, tokens);
        return true;
        
    }

    function transferFrom(address from, address to, uint tokens) public override returns (bool) {
        require(frozenAddresses[msg.sender]==false);
        require(tokens <= approved[from][msg.sender]);
        require(tokens <= balances[from]);

        
        balances[from] = balances[from].sub(tokens);
        approved[from][msg.sender] = approved[from][msg.sender].sub(tokens);
        balances[to] = balances[to].add(tokens);
        Transfer(from, to, tokens);
        return true;
    }
    
    function burn(uint tokens) public {
        require(tokens <= balances[msg.sender]);
        balances[msg.sender] = balanceOf(msg.sender).sub(tokens);
        _totalSupply = totalSupply().sub(tokens);
    }
    
    function totalSupply() public override view returns (uint256) {
        return _totalSupply;
    }
    
    
    function balanceOf(address tokenOwner) public view override returns (uint balance)  {
        return balances[tokenOwner];
    }
    
     function allowance(address tokenOwner, address spender) public view override returns (uint remaining) {
        return approved[tokenOwner][spender];
    }
   
    function approve(address spender, uint tokens) public override returns (bool success) {
        approved[msg.sender][spender] = tokens;
        Approval(msg.sender, spender, tokens);
        return true;
    }



}





pragma solidity ^0.5.0;

contract Token {
	using SafeMath for uint;

	string public name = "WCoin";
	string public symbol = "WCO";
	uint256 public decimals = 18;
	uint256 public totalSupply;
	mapping(address => uint256) public balanceOf;

	constructor() public {
		totalSupply = 1000000 * (10 ** decimals);
		balanceOf[msg.sender] = totalSupply;
	}
}

pragma solidity ^0.5.0;

import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Exchange {
	using SafeMath for uint; 

	address public feeAccount;
	uint256 public feePercentage;
	address constant ETHER = address(0);
	mapping(address => mapping(address => uint256)) public tokens;

	constructor (address _feeAccount, uint256 _feePercentage) public {
		feeAccount = _feeAccount;
		feePercentage = _feePercentage;
	}

	function depositToken(address _token, uint256 _amount) public {
		require(_token != ETHER);
		require(Token(_token).transferFrom(msg.sender, address(this), _amount));
		tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	function depositEther() payable public {
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
		emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
	}

	function withdrawToken(address _token, uint256 _amount) public {
		require(_token != ETHER);
		require(tokens[_token][msg.sender] >= _amount);
		require(Token(_token).transfer(msg.sender, _amount));
		tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	function withdrawEther(uint256 _amount) public {
		require(tokens[ETHER][msg.sender] >= _amount);
		msg.sender.transfer(_amount);
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
		emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
	}

	function balanceOf(address _token, address _user) public view returns (uint256) {
		return tokens[_token][_user];
	}

	/**FALLBACK**/
	function() external {
		revert();
	}

	event Deposit(address token, address user, uint256 amount, uint256 balance);
	event Withdraw(address token, address user, uint256 amount, uint256 balance);
}
pragma solidity ^0.4.24;

import './MyContractV3.sol';

contract MyContractV4 is MyContractV3{

  function emptyStringData() public {
      stringData = "";
  }
}

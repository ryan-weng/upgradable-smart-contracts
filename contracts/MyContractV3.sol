pragma solidity ^0.4.24;

import './MyContractV1.sol';

contract MyContractV3 is MyContractV1{
  string public stringData;

  function emptyUintData() public {
      uintData = 0;
  }

  function setStringData(string payload) public {
    stringData = payload;
  }
}

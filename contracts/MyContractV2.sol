pragma solidity ^0.4.24;

import './MyContractV1.sol';

contract MyContractV2 is MyContractV1{
  // initialize the state in the proxy (normally, this function should be constructor)
  function initialize(address oldContract) public {
    MyContractV1 c = MyContractV1(oldContract);
    uintData = c.uintData();
    bytes32ArrayData = c.getBytes32ArrayData();
    // migrating struct... cannot directly assign the mappingStructData from the old contract...
    // NOTE: it is not good to do loop inside contract because of gas limit
    // TODO: find better way?
    for (uint256 i; i < bytes32ArrayData.length; i++){
      uint a;
      string memory b;
      bool d;
      (a,b,d) = c.mappingStructData(bytes32ArrayData[i]);
      mappingStructData[bytes32ArrayData[i]] = myStruct({ uintData: a, stringData: b, boolData: d });
    }
  }
}

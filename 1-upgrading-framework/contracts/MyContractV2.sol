pragma solidity ^0.4.24;

import './MyContractV1.sol';

contract MyContractV2 is MyContractV1{
    // initialize the state in the proxy (normally, this function should be constructor)
    function initialize(address oldContract) public {
      MyContractV1 c = MyContractV1(oldContract);
      data = c.getData();
    }
}

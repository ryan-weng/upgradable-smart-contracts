pragma solidity ^0.4.24;

import './MyContractV1.sol';

contract MyContractV3 is MyContractV1{

    function emptyData() public {
        data = 0;
    }
}

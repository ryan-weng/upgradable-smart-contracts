pragma solidity ^0.4.24;

contract MyContractV1 {
    //// Structure definition
    uint data;

    function setData(uint payload) public {
        data = payload;
    }

    function getData() public view returns(uint)  {
        return data;
    }
}

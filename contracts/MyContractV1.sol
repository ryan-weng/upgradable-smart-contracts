pragma solidity ^0.4.24;

contract MyContractV1 {
  //// Structure definition
  struct myStruct {
    uint uintData;
    string stringData;
    bool boolData;
  }
  uint public uintData;
  bytes32[] public bytes32ArrayData;
  mapping(bytes32 => myStruct) public mappingStructData;

  function setUintData(uint payload) public {
    uintData = payload;
  }

  function addStructData(bytes32 bytes32Payload, uint uintPayload, string stringPayload, bool boolPayload) public {
    bytes32ArrayData.push(bytes32Payload);
    mappingStructData[bytes32Payload] = myStruct({ uintData: uintPayload, stringData: stringPayload, boolData: boolPayload });
  }

  function getBytes32ArrayData() public view returns(bytes32[]) {
    return bytes32ArrayData;
  }
}

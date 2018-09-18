var MyContractV1 = artifacts.require("MyContractV1");
var MyContractV2 = artifacts.require("MyContractV2");
var MyContractV3 = artifacts.require("MyContractV3");
var MyContractV4 = artifacts.require("MyContractV4");
var OwnedUpgradeabilityProxy = artifacts.require("OwnedUpgradeabilityProxy");

let MyContractV1Instance, MyContractV2Instance,
  MyContractV3Instance, MyContractV4Instance,
  ProxyInstance;
let inputUintData, inputStringData,
  inputBytes32TestData, inputStructUintData,
  inputStructStringData, inputStructBoolData;

beforeEach(async () => {
  // get contract instance
  MyContractV1Instance = await MyContractV1.deployed();
  MyContractV2Instance = await MyContractV2.deployed();
  MyContractV3Instance = await MyContractV3.deployed();
  MyContractV4Instance = await MyContractV4.deployed();
  ProxyInstance = await OwnedUpgradeabilityProxy.deployed();

  // initialize dummy data
  inputUintData = 999;
  inputStringData = "New Test String";
  inputBytes32TestData = web3.fromAscii('Test String',32);
  inputStructUintData = 8;
  inputStructStringData = "My String";
  inputStructBoolData = true;
});

describe('Upgradeable Smart Contract Test Cases', () => {
  it('deploys all of the contracts in the scenario', () => {
    assert.ok(MyContractV1Instance.address);
    assert.ok(MyContractV2Instance.address);
    assert.ok(MyContractV3Instance.address);
    assert.ok(MyContractV4Instance.address);
    assert.ok(ProxyInstance.address);
  });

  it('creates some dummy data in MyContractV1 instance (the data is stored inside MyContractV1 storage)', async () => {
    // set uintData
    await MyContractV1Instance.setUintData(inputUintData);
    let outputUintData = await MyContractV1Instance.uintData.call();
    assert.equal(inputUintData, outputUintData);

    // set structData & mapping
    await MyContractV1Instance.addStructData(inputBytes32TestData, inputStructUintData, inputStructStringData, inputStructBoolData);
    let outputStructData = await MyContractV1Instance.mappingStructData.call(inputBytes32TestData);
    assert.equal(inputStructUintData, outputStructData[0]);
    assert.equal(inputStructStringData, outputStructData[1]);
    assert.equal(inputStructBoolData, outputStructData[2]);
  });

  it('migrates the dummy data from MyContract1 instance to the Proxy storage using MyContractV2 logic', async () => {
    // set implementation variable in proxy
    await ProxyInstance.upgradeTo(MyContractV2Instance.address);
    let ProxyInstanceImplementation = await ProxyInstance.implementation.call();
    assert.equal(MyContractV2Instance.address, ProxyInstanceImplementation);

    // migrate dummy data
    let MyContractV2ByProxy = MyContractV2.at(ProxyInstance.address);
    await MyContractV2ByProxy.initialize(MyContractV1Instance.address);

    // check the migration result
    let outputUintData = await MyContractV2ByProxy.uintData.call();
    let outputStructData = await MyContractV2ByProxy.mappingStructData.call(inputBytes32TestData);
    assert.equal(outputUintData, inputUintData);
    assert.equal(outputStructData[0], inputStructUintData);
    assert.equal(outputStructData[1], inputStructStringData);
    assert.equal(outputStructData[2], inputStructBoolData);
  });

  it('upgrades the contract logic to MyContractV3 and add a new state variable called stringData', async () => {
    // set implementation variable in proxy
    await ProxyInstance.upgradeTo(MyContractV3Instance.address);
    let ProxyInstanceImplementation = await ProxyInstance.implementation.call();
    assert.equal(MyContractV3Instance.address, ProxyInstanceImplementation);

    // upgrade contract logic and state variables and check upgrade results
    let MyContractV3ByProxy = MyContractV3.at(ProxyInstance.address);
    let outputUintData = await MyContractV3ByProxy.uintData.call();
    let outputStructData = await MyContractV3ByProxy.mappingStructData.call(inputBytes32TestData);
    assert.equal(outputUintData, inputUintData);
    assert.equal(outputStructData[0], inputStructUintData);
    assert.equal(outputStructData[1], inputStructStringData);
    assert.equal(outputStructData[2], inputStructBoolData);

    // try new contract logic
    await MyContractV3ByProxy.emptyUintData();
    outputUintData = await MyContractV3ByProxy.uintData.call();
    assert.equal(outputUintData, 0);

    await MyContractV3ByProxy.setStringData(inputStringData);
    let outputStringData = await MyContractV3ByProxy.stringData.call();
    assert.equal(outputStringData, inputStringData);
  });

  it('upgrades the contract logic to MyContractV4', async () => {
    // set implementation variable in proxy
    await ProxyInstance.upgradeTo(MyContractV4Instance.address);
    let ProxyInstanceImplementation = await ProxyInstance.implementation.call();
    assert.equal(MyContractV4Instance.address, ProxyInstanceImplementation);

    // upgrade contract logic and check upgrade results
    let MyContractV4ByProxy = MyContractV4.at(ProxyInstance.address);
    let outputUintData = await MyContractV4ByProxy.uintData.call();
    let outputStringData = await MyContractV4ByProxy.stringData.call();
    let outputStructData = await MyContractV4ByProxy.mappingStructData.call(inputBytes32TestData);
    assert.equal(outputUintData, 0);
    assert.equal(outputStringData, inputStringData);
    assert.equal(outputStructData[0], inputStructUintData);
    assert.equal(outputStructData[1], inputStructStringData);
    assert.equal(outputStructData[2], inputStructBoolData);

    // try new contract logic
    await MyContractV4ByProxy.emptyStringData();
    outputStringData = await MyContractV4ByProxy.stringData.call();
    assert.equal(outputStringData, "");
  });
});

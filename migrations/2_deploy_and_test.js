var MyContractV1 = artifacts.require("MyContractV1");
var MyContractV2 = artifacts.require("MyContractV2");
var MyContractV3 = artifacts.require("MyContractV3");
var MyContractV4 = artifacts.require("MyContractV4");
var OwnedUpgradeabilityProxy = artifacts.require("OwnedUpgradeabilityProxy");

const assert = require("assert");

module.exports = deployer => {
  // Alternatively, just start a chain without a deployment
  deployer.then(async () => {
    // Deploy every smart contract
    // 1. proxy
    // 2. old contract (MyContractV1), assume this contract is already deployed on the chain and we want to upgrade it now.
    // 3. new contract that will initialize state of the proxy (MyContractV2)
    // 4. new contract with new function and new state variable (MyContractV3)
    // 5. new contract with new function (MyContractV4)
    let proxyInstance = await deployer.deploy(OwnedUpgradeabilityProxy);
    console.log("Deploying Proxy Contract. Proxy Instance address:",proxyInstance.address);
    let myContractV1Instance = await deployer.deploy(MyContractV1);
    console.log("Deploying MyContractV1 Contract. MyContractV1 instance address:",myContractV1Instance.address);
    let myContractV2Instance = await deployer.deploy(MyContractV2);
    console.log("Deploying MyContractV2 Contract. MyContractV2 instance address:",myContractV2Instance.address);
    let myContractV3Instance = await deployer.deploy(MyContractV3);
    console.log("Deploying MyContractV3 Contract. MyContractV3 instance address:",myContractV3Instance.address);
    let myContractV4Instance = await deployer.deploy(MyContractV4);
    console.log("Deploying MyContractV4 Contract. MyContractV4 instance address:",myContractV4Instance.address);

    // Update the data of the old contract first.
    // Let say we assume this contract is the deployed contract.
    let inputUintTestData1 = 5;
    await myContractV1Instance.setUintData(inputUintTestData1);
    let outputUintTestData1 = await myContractV1Instance.uintData.call();
    console.log("Set MyContractV1 uintData. Input:",inputUintTestData1, "Output:", outputUintTestData1);
    assert(inputUintTestData1, outputUintTestData1, "uintData is not set correctly");

    let inputBytes32TestData = web3.fromAscii('test1',32);
    let inputStructUintData = 1;
    let inputStructStringData = "a";
    let inputStructBoolData = true;
    await myContractV1Instance.addStructData(inputBytes32TestData, inputStructUintData, inputStructStringData, inputStructBoolData);
    let outputStructData = await myContractV1Instance.mappingStructData.call(inputBytes32TestData);
    console.log("Add struct data to MyContractV1..",outputStructData);
    assert(inputStructUintData, outputStructData[0],"uintStructData is not set correctly.");
    assert(inputStructStringData, outputStructData[1],"uintStructStringData is not set correctly.");
    assert(inputStructBoolData, outputStructData[2],"uintStructBoolData is not set correctly.");

    // Now we want to upgrade the old contract.
    // First, since we're using proxy, we need to initialize the state of the proxy
    // Therefore, we initialize it using the initialize() function in MyContractV2
    await proxyInstance.upgradeTo(myContractV2Instance.address);
    let proxyInstanceImplementation1 = await proxyInstance.implementation.call();
    console.log("Check if implementation variable in the proxy is equal to MyContractV2 address. Implementation:",proxyInstanceImplementation1);
    assert.equal(myContractV2Instance.address, proxyInstanceImplementation1, "Proxy implementation is not set correctly!");

    let myContractV2ByProxyInstance = MyContractV2.at(proxyInstance.address);
    await myContractV2ByProxyInstance.initialize(myContractV1Instance.address);
    let outputUintTestData2 = await myContractV2ByProxyInstance.uintData.call();
    let outputStructData2 = await myContractV2ByProxyInstance.mappingStructData.call(inputBytes32TestData);
    let outputStructUintData = outputStructData2[0];
    let outputStructStringData = outputStructData2[1];
    let outputStructBoolData = outputStructData2[2];
    console.log("Check if the proxy is initialized correctly. Data in the proxy:", outputUintTestData2);
    assert.equal(outputUintTestData2, inputUintTestData1, "Proxy uintData is not initialized correctly!");
    assert.equal(outputStructUintData, inputStructUintData, "Proxy structUintData is not initialized correctly!");
    assert.equal(outputStructStringData, inputStructStringData, "Proxy structStringData is not initialized correctly!");
    assert.equal(outputStructBoolData, inputStructBoolData, "Proxy structBoolData is not initialized correctly!");

    // Since our proxy is initialized already, now we try to upgrade the contract
    // After we upgrade it, we try to call the new function
    await proxyInstance.upgradeTo(myContractV3Instance.address);
    let proxyInstanceImplementation2 = await proxyInstance.implementation.call();
    console.log("Check if implementation variable in the proxy is equal to MyContractV3 address. Implementation:",proxyInstanceImplementation2);
    assert.equal(myContractV3Instance.address, proxyInstanceImplementation2, "Proxy implementation is not set correctly!");

    let myContractV3ByProxyInstance = MyContractV3.at(proxyInstance.address);
    await myContractV3ByProxyInstance.emptyUintData();
    let outputTestData3 = await myContractV3ByProxyInstance.uintData.call();
    console.log("Check if the uintData in the proxy is set to 0. Output:",outputTestData3);
    assert.equal(outputTestData3, 0, "The uintData in the proxy is not set correctly!");

    let inputStringData3 = "test";
    await myContractV3ByProxyInstance.setStringData(inputStringData3);
    let outputStringData3 = await myContractV3ByProxyInstance.stringData.call();
    console.log("Check if the stringData in the proxy is set to", inputStringData3);
    assert.equal(outputStringData3, inputStringData3,"The stringData in the proxy is not set correctly!");

    // try another upgrade
    await proxyInstance.upgradeTo(myContractV4Instance.address);
    let proxyInstanceImplementation3 = await proxyInstance.implementation.call();
    console.log("Check if implementation variable in the proxy is equal to MyContractV4 address. Implementation:",proxyInstanceImplementation3);
    assert.equal(myContractV4Instance.address, proxyInstanceImplementation3, "Proxy implementation is not set correctly!");

    let myContractV4ByProxyInstance = MyContractV4.at(proxyInstance.address);
    await myContractV4ByProxyInstance.emptyStringData();
    let outputTestData4 = await myContractV4ByProxyInstance.stringData.call();
    console.log("Check if the stringData in the proxy is emptied. ");
    assert.equal(outputTestData4, "", "The stringData in the proxy is not set correctly!");
  });
}

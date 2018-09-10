var MyContractV1 = artifacts.require("MyContractV1");
var MyContractV2 = artifacts.require("MyContractV2");
var MyContractV3 = artifacts.require("MyContractV3");
var OwnedUpgradeabilityProxy = artifacts.require("OwnedUpgradeabilityProxy");

const assert = require("assert");

module.exports = deployer => {
  // Alternatively, just start a chain without a deployment
  deployer.then(async () => {
    // Deploy every smart contract
    // 1. proxy
    // 2. old contract (MyContractV1), assume this contract is already deployed on the chain and we want to upgrade it now.
    // 3. new contract that will initialize state of the proxy (MyContractV2)
    // 4. new contract with new function (MyContractV3)
    let proxyInstance = await deployer.deploy(OwnedUpgradeabilityProxy);
    console.log("Deploying Proxy Contract. Proxy Instance address:",proxyInstance.address);
    let myContractV1Instance = await deployer.deploy(MyContractV1);
    console.log("Deploying MyContractV1 Contract. MyContractV1 instance address:",myContractV1Instance.address);
    let myContractV2Instance = await deployer.deploy(MyContractV2);
    console.log("Deploying MyContractV2 Contract. MyContractV2 instance address:",myContractV2Instance.address);
    let myContractV3Instance = await deployer.deploy(MyContractV3);
    console.log("Deploying MyContractV3 Contract. MyContractV3 instance address:",myContractV2Instance.address);

    // Update the data of the old contract first.
    // Let say we assume this contract is the deployed contract.
    let inputTestData1 = 5;
    await myContractV1Instance.setData(inputTestData1);
    let outputTestData1 = await myContractV1Instance.getData.call();
    console.log("Set MyContractV1 data. Input:",inputTestData1, "Output:", outputTestData1);

    // Now we want to upgrade the old contract.
    // First, since we're using proxy, we need to initialize the state of the proxy
    // Therefore, we initialize it using the initialize() function in MyContractV2
    await proxyInstance.upgradeTo(myContractV2Instance.address);
    let proxyInstanceImplementation1 = await proxyInstance.implementation.call();
    console.log("Check if implementation variable in the proxy is equal to MyContractV2 address. Implementation:",proxyInstanceImplementation1);
    assert.equal(myContractV2Instance.address, proxyInstanceImplementation1, "Proxy implementation is not set correctly!");

    let myContractV2ByProxyInstance = MyContractV2.at(proxyInstance.address);
    await myContractV2ByProxyInstance.initialize(myContractV1Instance.address);
    let outputTestData2 = await myContractV2ByProxyInstance.getData.call();
    console.log("Check if the proxy is initialized correctly. Data in the proxy:", outputTestData2);
    assert.equal(outputTestData2, inputTestData1, "Proxy is not initialized correctly!");

    // Since our proxy is initialized already, now we try to upgrade the contract
    // After we upgrade it, we try to call the new function
    await proxyInstance.upgradeTo(myContractV3Instance.address);
    let proxyInstanceImplementation2 = await proxyInstance.implementation.call();
    console.log("Check if implementation variable in the proxy is equal to MyContractV3 address. Implementation:",proxyInstanceImplementation2);
    assert.equal(myContractV3Instance.address, proxyInstanceImplementation2, "Proxy implementation is not set correctly!");

    let myContractV3ByProxyInstance = MyContractV3.at(proxyInstance.address);
    await myContractV3ByProxyInstance.emptyData();
    let outputTestData3 = await myContractV3ByProxyInstance.getData.call();
    console.log("Check if the data in the proxy is set to 0. Output:",outputTestData3);
    assert.equal(outputTestData3, 0, "The data in the proxy is not set correctly!");
  });
}

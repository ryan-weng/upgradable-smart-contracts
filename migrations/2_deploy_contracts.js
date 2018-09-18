var MyContractV1 = artifacts.require("MyContractV1");
var MyContractV2 = artifacts.require("MyContractV2");
var MyContractV3 = artifacts.require("MyContractV3");
var MyContractV4 = artifacts.require("MyContractV4");
var OwnedUpgradeabilityProxy = artifacts.require("OwnedUpgradeabilityProxy");

module.exports = deployer => {
  deployer.deploy(MyContractV1);
  deployer.deploy(MyContractV2);
  deployer.deploy(MyContractV3);
  deployer.deploy(MyContractV4);
  deployer.deploy(OwnedUpgradeabilityProxy);
}

// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
import "@nomiclabs/hardhat-ethers";
import { artifacts, ethers, network } from "hardhat";
import path = require("path");

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const QuizFactory = await ethers.getContractFactory("QuizFactory");
  const QuizFactoryDeployed = await QuizFactory.deploy();
  await QuizFactoryDeployed.deployed();

  console.log("QuizFactory address:", QuizFactoryDeployed.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(QuizFactoryDeployed);
}

function saveFrontendFiles(QuizFactory: any) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ QuizFactory: QuizFactory.address }, undefined, 2)
  );

  const QuizFactoryArtifact = artifacts.readArtifactSync("QuizFactory");

  fs.writeFileSync(
    path.join(contractsDir, "QuizFactory.json"),
    JSON.stringify(QuizFactoryArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

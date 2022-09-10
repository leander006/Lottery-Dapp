const { expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat.config")

!developmentChains.includes(network.name)
    ? describe.skep
    : describe("Raffle Unit Test", function () {
          let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer
          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              raffle = await ethers.getContract("Raffle", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("Contructor", async function () {
              it("Initialize the raffle correctly", async function () {
                  const raffleState = await raffle.getRaffleState()
                  const interval = await raffle.getInterval()
                  expect(raffleState.toString()).to.equal("0")
                  expect(interval.toString()).to.equal(networkConfig[chainId]["interval"])
              })
          })

          describe("enterRaffle", async () => {
              it("reverts if they don't pay enough ", async function () {
                  await expect(raffle.enterRaffle()).to.be.revertedWith(
                      "Raffle__NotEnoughEthEntered"
                  )
              })

              it("record player when they enter", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  const playerFromContract = await raffle.getPlayer(0)
                  expect(playerFromContract).to.equal(deployer)
              })
              it("emit event on enter", async function () {
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
                      raffle,
                      "RaffleEnter"
                  )
              })
              it("Doesn't allow to enter when raffle is in calculating state",async function(){
                    
              })
          })
      })

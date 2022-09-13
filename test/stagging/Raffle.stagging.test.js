const { assert, expect } = require("chai")
const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat.config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Staging Tests", function () {
          let raffle, raffleEntranceFee, deployer

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("fulfillRandomWords", function () {
              it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
                  // enter the raffle
                  const startingTimeStamp = await raffle.getLatestTimeStamps()
                  const accounts = await ethers.getSigners()
                  await new Promise(async (resolve, reject) => {
                      console.log("Enter promise....")
                      // setup listener before we enter the raffle
                      // Just in case the blockchain moves REALLY fast
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!")
                          try {
                              // add our asserts here
                              const recentWinner = await raffle.getRecentWinner()
                              console.log("winner ", recentWinner)
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await raffle.getLatestTimeStamps()
                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(raffleState, 0)
                              //   console.log("Gas ", gas)
                              //   console.log(
                              //       "expected difference ",
                              //       winnerEndingBalance.sub(winnerStartingBalance).toString()
                              //   )
                              //   console.log(
                              //       "winnerEndingBalance.add(gas) ",
                              //       winnerEndingBalance.toString()
                              //   )
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              )
                              assert(endingTimeStamp > startingTimeStamp)
                              //   console.log("---End of loop ------")
                              resolve()
                          } catch (error) {
                              console.log(error.message)
                              reject(error)
                          }
                          //   console.log("---End of WinnerPicked ------")
                      })
                      // Then entering the raffle
                      const StartingBalance = await accounts[0].getBalance()
                      console.log("StartingBalance ", StartingBalance.toString())
                      const tx = await raffle.enterRaffle({ value: raffleEntranceFee })
                      await tx.wait(1)
                      const winnerStartingBalance = await accounts[0].getBalance()
                      //   console.log("winnerStartingBalance ", winnerStartingBalance.toString())

                      // and this code WONT complete until our listener has finished listening!
                  })
                  //   console.log("---End of promise---")
              })
          })
      })

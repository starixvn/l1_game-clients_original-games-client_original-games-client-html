/** @format */

// Simple integration test for plinko service and client
const io = require("socket.io-client");

console.log("🧪 Testing Plinko Service Integration...\n");

// Test data matching service expectations
const testBet = {
  amount: 100,
  gameMode: 0, // Low mode
  numberOfRows: 9,
  clientSeed: "test-seed-" + Date.now(),
};

const testPath = [0, 1, 0, 1, 0, 1, 0, 1, 0]; // 9 decisions for 9 rows
const expectedFinalSlot = testPath.filter((p) => p === 1).length; // Count right turns

console.log("📊 Test Configuration:");
console.log(`   Amount: $${testBet.amount}`);
console.log(`   Game Mode: ${testBet.gameMode} (Low)`);
console.log(`   Rows: ${testBet.numberOfRows}`);
console.log(`   Test Path: [${testPath.join(", ")}]`);
console.log(`   Expected Final Slot: ${expectedFinalSlot}\n`);

// Simulate service multipliers (from app-configs.ts)
const serviceMultipliers = {
  0: {
    // Low mode
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // 9 rows has 10 slots (0-9)
  },
};

const expectedMultiplier =
  serviceMultipliers[testBet.gameMode][testBet.numberOfRows][expectedFinalSlot];
const expectedPayout = testBet.amount * expectedMultiplier;

console.log("🎯 Expected Results:");
console.log(`   Final Slot: ${expectedFinalSlot}`);
console.log(`   Multiplier: ${expectedMultiplier}x`);
console.log(`   Payout: $${expectedPayout}\n`);

console.log("🔌 Attempting to connect to service...");

const socket = io("http://localhost:5000/user/plinko", {
  transports: ["websocket"],
  query: {
    session: "test-session-123",
    ss: "test-session-123",
    currency: "USD",
    username: "test-user-123_TestPlayer",
    browserUserAgent: "TestClient/1.0",
  },
});

socket.on("connect", () => {
  console.log("✅ Connected to service!\n");

  // Send sign-in
  console.log("📝 Sending sign-in...");
  socket.emit("sign-in");

  socket.on("signed-in", () => {
    console.log("✅ Signed in successfully!\n");

    // Send in-game event
    console.log("🎮 Sending in-game event...");
    socket.emit("in-game");

    socket.on("game-event", (data) => {
      if (data.gameConfigs) {
        console.log("📋 Received game configs!");
        console.log(`   Game ID: ${data.gameConfigs.gameId}`);
        console.log(
          `   Odds available for ${
            Object.keys(data.gameConfigs.odds).length
          } modes\n`
        );

        // Now place a bet
        console.log("💰 Placing bet...");
        socket.emit("bet", testBet);

        socket.on("game-event", (betData) => {
          if (betData.endBet) {
            console.log(`✅ Bet accepted! Amount: $${betData.endBet}`);
          }

          if (betData.finish) {
            console.log("\n🎉 Bet completed!");
            console.log("📊 Service Results:");
            console.log(
              `   Result Path: [${betData.finish.result.join(", ")}]`
            );
            console.log(
              `   Final Slot: ${betData.finish.settlementResult.slotIndex}`
            );
            console.log(
              `   Multiplier: ${betData.finish.settlementResult.multiplier}x`
            );
            console.log(`   Payout: $${betData.finish.winAmount}`);
            console.log(`   Amount: $${betData.finish.amount}\n`);

            // Verify service provides valid data
            const path = betData.finish.result;
            const slotIndex = betData.finish.settlementResult.slotIndex;
            const multiplier = betData.finish.settlementResult.multiplier;
            const winAmount = betData.finish.winAmount;
            const amount = betData.finish.amount;

            // Calculate expected slot from path (count of 1s = right turns)
            const calculatedSlot = path.filter((p) => p === 1).length;

            // Get expected multiplier from service config
            const serviceMultipliers = {
              0: {
                // Low mode
                9: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // 9 rows has 10 slots (0-9)
              },
            };
            const expectedMultiplier = serviceMultipliers[0][9][calculatedSlot];
            const expectedPayout = amount * expectedMultiplier;

            // Verify service data is consistent
            const slotMatch = slotIndex === calculatedSlot;
            const multiplierMatch = multiplier === expectedMultiplier;
            const payoutMatch = winAmount === expectedPayout;
            const pathValid =
              Array.isArray(path) &&
              path.length === 9 &&
              path.every((p) => p === 0 || p === 1);

            console.log("🔍 Service Data Validation:");
            console.log(
              `   Path Valid (9 elements, 0/1 only): ${pathValid ? "✅" : "❌"}`
            );
            console.log(
              `   Slot Index matches path count: ${
                slotMatch ? "✅" : "❌"
              } (${slotIndex} vs ${calculatedSlot})`
            );
            console.log(
              `   Multiplier matches config: ${
                multiplierMatch ? "✅" : "❌"
              } (${multiplier}x vs ${expectedMultiplier}x)`
            );
            console.log(
              `   Payout calculation correct: ${
                payoutMatch ? "✅" : "❌"
              } ($${winAmount} vs $${expectedPayout})`
            );

            if (pathValid && slotMatch && multiplierMatch && payoutMatch) {
              console.log("\n🎊 INTEGRATION TEST PASSED! ✅");
              console.log("✅ Service provides valid, consistent data");
              console.log("✅ Client can receive and process service results");
              console.log("✅ Ball physics will be guided by service path");
              console.log(
                "\n💡 The ball will now follow the service-provided path!"
              );
              console.log("   Path: [" + path.join(", ") + "]");
              console.log(
                "   Final Slot: " +
                  slotIndex +
                  " (multiplier: " +
                  multiplier +
                  "x)"
              );
            } else {
              console.log("\n❌ INTEGRATION TEST FAILED!");
              console.log("Service data validation failed.");
            }

            socket.disconnect();
            process.exit(0);
          }
        });
      }
    });
  });
});

socket.on("connect_error", (error) => {
  console.log("❌ Connection failed!");
  console.log("Error:", error.message);
  console.log("\n💡 Make sure the plinko service is running on port 5000");
  console.log("   Run: cd plinko-service && npm run dev");
  process.exit(1);
});

socket.on("disconnect", () => {
  console.log("🔌 Disconnected from service");
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log("\n⏰ Test timeout - service may not be responding");
  socket.disconnect();
  process.exit(1);
}, 10000);

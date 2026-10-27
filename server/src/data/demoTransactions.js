/**
 * Synthetic transaction dataset with planted fraud patterns
 * For demonstration purposes only - not real financial data
 */

export function generateDemoTransactions() {
  const transactions = [];
  let txId = 1000;
  
  const baseDate = new Date('2024-01-15T08:00:00Z');
  
  // Helper to create transaction
  const addTx = (sender, receiver, amount, minutesOffset, channel = 'WIRE') => {
    const timestamp = new Date(baseDate.getTime() + minutesOffset * 60000);
    transactions.push({
      id: `TX${txId++}`,
      sender,
      receiver,
      amount,
      currency: 'USD',
      timestamp: timestamp.toISOString(),
      channel,
      status: 'COMPLETED'
    });
  };

  // === PATTERN 1: Circular Transfers (Planted) ===
  // Circle 1: ACC001 → ACC002 → ACC003 → ACC001
  addTx('ACC001', 'ACC002', 15000, 10);
  addTx('ACC002', 'ACC003', 14500, 30);
  addTx('ACC003', 'ACC001', 14000, 50);

  // Circle 2: ACC010 → ACC011 → ACC012 → ACC013 → ACC010
  addTx('ACC010', 'ACC011', 8000, 100);
  addTx('ACC011', 'ACC012', 7800, 120);
  addTx('ACC012', 'ACC013', 7600, 140);
  addTx('ACC013', 'ACC010', 7400, 160);

  // Circle 3: ACC020 → ACC021 → ACC022 → ACC020
  addTx('ACC020', 'ACC021', 25000, 200);
  addTx('ACC021', 'ACC022', 24000, 220);
  addTx('ACC022', 'ACC020', 23000, 240);

  // === PATTERN 2: Rapid Fund Movement (Planted) ===
  // Account ACC050 receives and quickly forwards
  addTx('ACC048', 'ACC050', 12000, 300);
  addTx('ACC050', 'ACC051', 11500, 310); // 10 minutes later
  
  addTx('ACC049', 'ACC050', 8000, 320);
  addTx('ACC050', 'ACC052', 7800, 335); // 15 minutes later

  // Account ACC060 rapid movement
  addTx('ACC058', 'ACC060', 20000, 400);
  addTx('ACC060', 'ACC061', 19500, 420); // 20 minutes later

  // === PATTERN 3: Suspicious Transaction Chains (Planted) ===
  // Long chain: ACC070 → ACC071 → ACC072 → ACC073 → ACC074
  addTx('ACC070', 'ACC071', 30000, 500);
  addTx('ACC071', 'ACC072', 28000, 520);
  addTx('ACC072', 'ACC073', 26000, 540);
  addTx('ACC073', 'ACC074', 24000, 560);

  // Another chain: ACC080 → ACC081 → ACC082 → ACC083
  addTx('ACC080', 'ACC081', 18000, 600);
  addTx('ACC081', 'ACC082', 17000, 615);
  addTx('ACC082', 'ACC083', 16000, 630);

  // === PATTERN 4: Potential Mule Account (Planted) ===
  // ACC100 receives from many sources and distributes
  addTx('ACC101', 'ACC100', 5000, 700);
  addTx('ACC102', 'ACC100', 6000, 710);
  addTx('ACC103', 'ACC100', 4500, 720);
  addTx('ACC104', 'ACC100', 7000, 730);
  addTx('ACC105', 'ACC100', 5500, 740);
  addTx('ACC106', 'ACC100', 6500, 750);
  
  // Then distributes to many destinations
  addTx('ACC100', 'ACC107', 3000, 760);
  addTx('ACC100', 'ACC108', 4000, 770);
  addTx('ACC100', 'ACC109', 3500, 780);
  addTx('ACC100', 'ACC110', 5000, 790);
  addTx('ACC100', 'ACC111', 4500, 800);
  addTx('ACC100', 'ACC112', 6000, 810);

  // Another potential mule ACC150
  addTx('ACC151', 'ACC150', 8000, 900);
  addTx('ACC152', 'ACC150', 9000, 910);
  addTx('ACC153', 'ACC150', 7500, 920);
  addTx('ACC154', 'ACC150', 8500, 930);
  addTx('ACC155', 'ACC150', 9500, 940);
  
  addTx('ACC150', 'ACC156', 6000, 950);
  addTx('ACC150', 'ACC157', 7000, 960);
  addTx('ACC150', 'ACC158', 8000, 970);
  addTx('ACC150', 'ACC159', 6500, 980);
  addTx('ACC150', 'ACC160', 7500, 990);

  // === PATTERN 5: Transaction Bursts (Planted) ===
  // ACC200 has burst of activity
  for (let i = 0; i < 12; i++) {
    addTx('ACC200', `ACC${220 + i}`, 1000 + i * 100, 1100 + i * 3);
  }

  // === PATTERN 6: High-Value Transactions (Planted) ===
  addTx('ACC300', 'ACC301', 75000, 1200);
  addTx('ACC302', 'ACC303', 95000, 1220);
  addTx('ACC304', 'ACC305', 120000, 1240);

  // === NORMAL TRANSACTIONS (Not suspicious) ===
  // Regular business transactions
  addTx('ACC400', 'ACC401', 5000, 1300);
  addTx('ACC401', 'ACC402', 3000, 1500);
  addTx('ACC403', 'ACC404', 2500, 1700);
  addTx('ACC404', 'ACC405', 4000, 1900);
  
  // Salary payments
  addTx('ACC500', 'ACC501', 3500, 2000, 'ACH');
  addTx('ACC500', 'ACC502', 3500, 2001, 'ACH');
  addTx('ACC500', 'ACC503', 4000, 2002, 'ACH');
  addTx('ACC500', 'ACC504', 3800, 2003, 'ACH');
  addTx('ACC500', 'ACC505', 3600, 2004, 'ACH');

  // Vendor payments
  addTx('ACC600', 'ACC601', 12000, 2100);
  addTx('ACC600', 'ACC602', 8500, 2200);
  addTx('ACC600', 'ACC603', 15000, 2300);

  // Customer payments
  addTx('ACC701', 'ACC700', 500, 2400);
  addTx('ACC702', 'ACC700', 750, 2420);
  addTx('ACC703', 'ACC700', 1200, 2440);
  addTx('ACC704', 'ACC700', 300, 2460);
  addTx('ACC705', 'ACC700', 890, 2480);

  // Utility payments
  addTx('ACC800', 'ACC850', 150, 2500);
  addTx('ACC801', 'ACC850', 200, 2520);
  addTx('ACC802', 'ACC850', 175, 2540);

  // Insurance payments
  addTx('ACC900', 'ACC950', 1200, 2600);
  addTx('ACC901', 'ACC950', 1500, 2620);
  addTx('ACC902', 'ACC950', 1100, 2640);

  // Loan repayments
  addTx('ACC1000', 'ACC1050', 2500, 2700);
  addTx('ACC1001', 'ACC1050', 3000, 2720);
  addTx('ACC1002', 'ACC1050', 2800, 2740);

  // Investment transfers
  addTx('ACC1100', 'ACC1150', 10000, 2800);
  addTx('ACC1101', 'ACC1150', 15000, 2820);
  addTx('ACC1102', 'ACC1150', 12000, 2840);

  // Retail purchases
  addTx('ACC1200', 'ACC1250', 250, 2900, 'CARD');
  addTx('ACC1201', 'ACC1250', 180, 2910, 'CARD');
  addTx('ACC1202', 'ACC1250', 420, 2920, 'CARD');
  addTx('ACC1203', 'ACC1250', 95, 2930, 'CARD');

  // Subscription payments
  addTx('ACC1300', 'ACC1350', 50, 3000);
  addTx('ACC1301', 'ACC1350', 100, 3020);
  addTx('ACC1302', 'ACC1350', 75, 3040);

  // Peer-to-peer transfers
  addTx('ACC1400', 'ACC1401', 200, 3100, 'P2P');
  addTx('ACC1401', 'ACC1402', 150, 3200, 'P2P');
  addTx('ACC1402', 'ACC1403', 100, 3300, 'P2P');

  // Refunds
  addTx('ACC1500', 'ACC1501', 350, 3400);
  addTx('ACC1502', 'ACC1503', 180, 3420);

  // International transfers
  addTx('ACC1600', 'ACC1601', 5000, 3500, 'SWIFT');
  addTx('ACC1602', 'ACC1603', 3500, 3600, 'SWIFT');

  // Gift transfers
  addTx('ACC1700', 'ACC1701', 500, 3700);
  addTx('ACC1702', 'ACC1703', 1000, 3800);

  // Charitable donations
  addTx('ACC1800', 'ACC1850', 250, 3900);
  addTx('ACC1801', 'ACC1850', 500, 3920);
  addTx('ACC1802', 'ACC1850', 1000, 3940);

  // Rental payments
  addTx('ACC1900', 'ACC1950', 1500, 4000);
  addTx('ACC1901', 'ACC1950', 1800, 4020);
  addTx('ACC1902', 'ACC1950', 2000, 4040);

  // Medical payments
  addTx('ACC2000', 'ACC2050', 350, 4100);
  addTx('ACC2001', 'ACC2050', 500, 4120);
  addTx('ACC2002', 'ACC2050', 750, 4140);

  // Tuition payments
  addTx('ACC2100', 'ACC2150', 5000, 4200);
  addTx('ACC2101', 'ACC2150', 4500, 4220);

  // More normal inter-account transfers
  addTx('ACC2200', 'ACC2201', 3000, 4300);
  addTx('ACC2202', 'ACC2203', 2500, 4400);
  addTx('ACC2204', 'ACC2205', 4500, 4500);
  addTx('ACC2206', 'ACC2207', 1500, 4600);
  addTx('ACC2208', 'ACC2209', 3500, 4700);

  // Business-to-business payments
  addTx('ACC2300', 'ACC2301', 8000, 4800);
  addTx('ACC2302', 'ACC2303', 12000, 4900);
  addTx('ACC2304', 'ACC2305', 6500, 5000);

  // Freelancer payments
  addTx('ACC2400', 'ACC2401', 2500, 5100);
  addTx('ACC2400', 'ACC2402', 3000, 5120);
  addTx('ACC2400', 'ACC2403', 2800, 5140);

  // Small business expenses
  addTx('ACC2500', 'ACC2501', 450, 5200);
  addTx('ACC2500', 'ACC2502', 780, 5220);
  addTx('ACC2500', 'ACC2503', 320, 5240);
  addTx('ACC2500', 'ACC2504', 590, 5260);

  // More diverse normal activity
  for (let i = 0; i < 50; i++) {
    const sender = `ACC${3000 + Math.floor(i / 2)}`;
    const receiver = `ACC${3100 + Math.floor(Math.random() * 50)}`;
    const amount = Math.floor(Math.random() * 5000) + 100;
    const offset = 5500 + i * 30;
    addTx(sender, receiver, amount, offset);
  }

  console.log(`Generated ${transactions.length} synthetic transactions`);
  console.log('Planted patterns:');
  console.log('  - 3 circular transfer patterns');
  console.log('  - 3 rapid fund movement examples');
  console.log('  - 2 suspicious transaction chains');
  console.log('  - 2 potential mule accounts');
  console.log('  - 1 transaction burst');
  console.log('  - 3 high-value transactions');
  
  return transactions;
}

export const demoTransactions = generateDemoTransactions();

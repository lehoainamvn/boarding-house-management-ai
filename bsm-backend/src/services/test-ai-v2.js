/**
 * Test file cho AI Service V2
 * Chạy: node src/services/test-ai-v2.js
 */

import { classifyIntent } from "./intentClassifier.service.js";
import { manageContext } from "./contextManager.service.js";
import { generateSuggestions } from "./suggestionEngine.service.js";

async function testIntentClassifier() {
  console.log("\n=== TEST INTENT CLASSIFIER ===\n");

  const testCases = [
    // CHAT - Chào hỏi (4 tests)
    { question: "Xin chào", expected: "CHAT" },
    { question: "Hello", expected: "CHAT" },
    { question: "Bạn là ai?", expected: "CHAT" },
    { question: "Tên tôi là gì?", expected: "CHAT" },
    
    // DATABASE - Có tên nhà cụ thể (8 tests)
    { question: "Doanh thu nhà Sunrise tháng này", expected: "DATABASE" },
    { question: "Phòng trống nhà Sunrise", expected: "DATABASE" },
    { question: "Khách thuê nhà Green Home", expected: "DATABASE" },
    { question: "Ai nợ tiền phòng nhà Sunrise", expected: "DATABASE" },
    { question: "Hóa đơn chưa thanh toán tháng này", expected: "DATABASE" },
    { question: "Chỉ số điện nước tháng này", expected: "DATABASE" },
    { question: "So sánh doanh thu tháng này với tháng trước", expected: "DATABASE" },
    { question: "Tổng số phòng nhà Sunrise", expected: "DATABASE" },
    
    // AMBIGUOUS - Thiếu thông tin (6 tests)
    { question: "Doanh thu tháng này", expected: "AMBIGUOUS" },
    { question: "Ai chưa đóng tiền?", expected: "AMBIGUOUS" },
    { question: "Còn bao nhiêu phòng?", expected: "AMBIGUOUS" },
    { question: "Tổng số phòng", expected: "AMBIGUOUS" },
    { question: "Phòng trống", expected: "AMBIGUOUS" },
    { question: "Danh sách khách thuê", expected: "AMBIGUOUS" }
  ];

  let passed = 0;
  let failed = 0;
  const failedTests = [];

  for (const testCase of testCases) {
    try {
      const result = await classifyIntent(testCase.question, []);
      const isPass = result.intent === testCase.expected;
      const status = isPass ? "✅ PASS" : "❌ FAIL";
      
      console.log(`${status} | "${testCase.question}" → ${result.intent} (expected: ${testCase.expected})`);
      
      if (isPass) {
        passed++;
      } else {
        failed++;
        failedTests.push({
          question: testCase.question,
          expected: testCase.expected,
          got: result.intent
        });
      }
    } catch (error) {
      failed++;
      console.log(`❌ ERROR | "${testCase.question}" → ${error.message}`);
      failedTests.push({
        question: testCase.question,
        expected: testCase.expected,
        got: "ERROR"
      });
    }
  }
  
  console.log(`\n📊 Intent Classifier: ${passed} passed, ${failed} failed (Total: ${passed + failed})`);
  console.log(`   Accuracy: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failedTests.length > 0 && failedTests.length <= 5) {
    console.log(`\n⚠️  Failed tests:`);
    failedTests.forEach(test => {
      console.log(`   - "${test.question}": expected ${test.expected}, got ${test.got}`);
    });
  }
}

function testContextManager() {
  console.log("\n=== TEST CONTEXT MANAGER ===\n");

  const houses = [
    { id: 1, name: "Sunrise House", address: "123 ABC" },
    { id: 2, name: "Green Home", address: "456 DEF" },
    { id: 3, name: "Moonlight", address: "789 GHI" }
  ];

  const testCases = [
    // Test nhận diện nhà
    {
      question: "Doanh thu nhà Sunrise tháng này",
      expected: { house: "Sunrise House", houseId: 1, topic: "revenue" }
    },
    {
      question: "Phòng trống nhà Green Home",
      expected: { house: "Green Home", houseId: 2, topic: "room" }
    },
    {
      question: "Khách thuê nhà Moonlight",
      expected: { house: "Moonlight", houseId: 3, topic: "tenant" }
    },
    
    // Test nhận diện topic
    {
      question: "Ai chưa đóng tiền điện?",
      expected: { topic: "invoice" }
    },
    {
      question: "Khách thuê hiện tại",
      expected: { topic: "tenant" }
    },
    {
      question: "Chỉ số điện nước tháng này",
      expected: { topic: "meter" }
    },
    {
      question: "Hóa đơn chưa thanh toán",
      expected: { topic: "invoice" }
    },
    
    // Test nhận diện thời gian
    {
      question: "Doanh thu tháng trước",
      expected: { topic: "revenue", hasMonth: true }
    },
    {
      question: "Phòng trống tháng này",
      expected: { topic: "room", hasMonth: true }
    },
    
    // Test không có nhà cụ thể
    {
      question: "Tổng doanh thu",
      expected: { house: null, topic: "revenue" }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      const context = manageContext(testCase.question, [], houses);
      
      let testPassed = true;
      let failReasons = [];
      
      // Kiểm tra house
      if (testCase.expected.house !== undefined) {
        if (context.house !== testCase.expected.house) {
          testPassed = false;
          failReasons.push(`house: expected "${testCase.expected.house}", got "${context.house}"`);
        }
      }
      
      // Kiểm tra houseId
      if (testCase.expected.houseId !== undefined) {
        if (context.houseId !== testCase.expected.houseId) {
          testPassed = false;
          failReasons.push(`houseId: expected ${testCase.expected.houseId}, got ${context.houseId}`);
        }
      }
      
      // Kiểm tra topic
      if (testCase.expected.topic !== undefined) {
        if (context.topic !== testCase.expected.topic) {
          testPassed = false;
          failReasons.push(`topic: expected "${testCase.expected.topic}", got "${context.topic}"`);
        }
      }
      
      // Kiểm tra có month không
      if (testCase.expected.hasMonth !== undefined) {
        if (!context.month) {
          testPassed = false;
          failReasons.push(`month: expected to have value, got null`);
        }
      }

      const status = testPassed ? "✅ PASS" : "❌ FAIL";
      console.log(`${status} | "${testCase.question}"`);
      
      if (testPassed) {
        passed++;
        console.log(`  → house: ${context.house || "null"}, houseId: ${context.houseId || "null"}, topic: ${context.topic || "null"}, month: ${context.month}`);
      } else {
        failed++;
        console.log(`  → ${failReasons.join(", ")}`);
        console.log(`  → Got: house: ${context.house || "null"}, houseId: ${context.houseId || "null"}, topic: ${context.topic || "null"}, month: ${context.month}`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ ERROR | "${testCase.question}" → ${error.message}`);
    }
  }
  
  console.log(`\n📊 Context Manager: ${passed} passed, ${failed} failed (Total: ${passed + failed})`);
}

function testSuggestionEngine() {
  console.log("\n=== TEST SUGGESTION ENGINE ===\n");

  const testCases = [
    // CHAT
    {
      intent: "CHAT",
      question: "Xin chào",
      data: [],
      context: {}
    },
    {
      intent: "CHAT",
      question: "Bạn là ai?",
      data: [],
      context: {}
    },
    
    // DATABASE - Revenue
    {
      intent: "DATABASE",
      question: "Doanh thu tháng này",
      data: [{ DoanhThu: 50000000 }],
      context: { topic: "revenue" }
    },
    {
      intent: "DATABASE",
      question: "Doanh thu nhà Sunrise",
      data: [{ TenNha: "Sunrise", DoanhThu: 30000000 }],
      context: { topic: "revenue", house: "Sunrise House" }
    },
    
    // DATABASE - Invoice
    {
      intent: "DATABASE",
      question: "Ai chưa đóng tiền?",
      data: [{ TrangThai: "UNPAID" }],
      context: { topic: "invoice" }
    },
    {
      intent: "DATABASE",
      question: "Hóa đơn đã thanh toán",
      data: [{ TrangThai: "PAID" }],
      context: { topic: "invoice" }
    },
    
    // DATABASE - Room
    {
      intent: "DATABASE",
      question: "Phòng trống",
      data: [{ TrangThai: "Trống" }],
      context: { topic: "room" }
    },
    {
      intent: "DATABASE",
      question: "Phòng đang thuê",
      data: [{ TrangThai: "Đang thuê" }],
      context: { topic: "room" }
    },
    
    // DATABASE - Tenant
    {
      intent: "DATABASE",
      question: "Danh sách khách thuê",
      data: [{ TenKhach: "Nguyễn Văn A" }],
      context: { topic: "tenant" }
    },
    
    // DATABASE - Meter
    {
      intent: "DATABASE",
      question: "Chỉ số điện nước",
      data: [{ DienTieuThu: 100 }],
      context: { topic: "meter" }
    },
    
    // AMBIGUOUS
    {
      intent: "AMBIGUOUS",
      question: "Còn bao nhiêu phòng?",
      data: [],
      context: {}
    },
    {
      intent: "AMBIGUOUS",
      question: "Doanh thu thế nào?",
      data: [],
      context: { house: "Sunrise House" }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      const suggestions = generateSuggestions(
        testCase.intent,
        testCase.question,
        testCase.data,
        testCase.context
      );

      // Kiểm tra có đúng 2 gợi ý không
      const isValid = Array.isArray(suggestions) && suggestions.length === 2;
      const status = isValid ? "✅ PASS" : "❌ FAIL";
      
      console.log(`${status} | "${testCase.question}" (${testCase.intent})`);
      console.log(`  → Suggestions: ${JSON.stringify(suggestions)}`);
      
      if (isValid) {
        passed++;
      } else {
        failed++;
        console.log(`  → Expected 2 suggestions, got ${suggestions.length}`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ ERROR | "${testCase.question}" → ${error.message}`);
    }
  }
  
  console.log(`\n📊 Suggestion Engine: ${passed} passed, ${failed} failed (Total: ${passed + failed})`);
}

async function runAllTests() {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║   BSM AI SERVICE V2 - TEST SUITE      ║");
  console.log("╚════════════════════════════════════════╝");

  try {
    await testIntentClassifier();
    testContextManager();
    testSuggestionEngine();

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   TEST COMPLETED                       ║");
    console.log("╚════════════════════════════════════════╝\n");
  } catch (error) {
    console.error("\n❌ TEST SUITE ERROR:", error);
  }
}

// Chạy tests
runAllTests();

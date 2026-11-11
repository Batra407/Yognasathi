/**
 * YojanaSathi 2.0 AI Brain Comprehensive Verification Suite
 * Tests Conversation Test Cases A through H against the live AI conversational engine,
 * persistent PostgreSQL memory, and multi-turn dialogue requirements.
 */

const { POST: chatPost } = require('../src/app/api/ai/chat/route.js');
const { clearSession, getSession, getProfile } = require('../src/lib/conversationMemory.js');
const persistent = require('../src/lib/persistentMemory.js');

async function mockChatCall(sessionId, message, language = 'en') {
  const req = {
    json: async () => ({ sessionId, message, language })
  };
  const res = await chatPost(req);
  return await res.json();
}

async function runTests() {
  console.log("=======================================================================");
  console.log("YOJANASATHI 2.0 AI BRAIN — ADVANCED CONVERSATION & MEMORY TEST SUITE");
  console.log("=======================================================================\n");

  let allPassed = true;

  // TEST A: Punjab Farmer 45 yo
  console.log("-----------------------------------------------------------------------");
  console.log("TEST A: Single-turn Punjab Farmer Profile Extraction & Matching");
  console.log("Input: 'I am a farmer, 45 years old, from Punjab.'");
  const sidA = "test_sess_A_" + Date.now();
  clearSession(sidA);
  const resA = await mockChatCall(sidA, "I am a farmer, 45 years old, from Punjab.", "en");

  console.log("Extracted Profile:", JSON.stringify(resA.cumulativeProfile));
  console.log("Schemes Found:", resA.schemes.length);
  if (resA.schemes.length > 0) {
    console.log("Top Scheme:", resA.schemes[0].schemeName, `(${resA.schemes[0].state}) - Status: ${resA.schemes[0].eligibilityStatus}`);
  }

  const passA = resA.cumulativeProfile.occupation === 'farmer' &&
                resA.cumulativeProfile.age === 45 &&
                resA.cumulativeProfile.state === 'Punjab' &&
                resA.schemes.every(s => !s.state || s.state.toLowerCase() === 'punjab' || s.state.toLowerCase() === 'national / central');
  console.log("TEST A RESULT:", passA ? "✅ PASSED" : "❌ FAILED");
  if (!passA) allPassed = false;

  // TEST B: Haryana Farmer with Land (Geographic Filtering)
  console.log("\n-----------------------------------------------------------------------");
  console.log("TEST B: Haryana Geographic Filtering (No Punjab schemes allowed)");
  console.log("Input: 'I am a farmer from Haryana and own 3 acres.'");
  const sidB = "test_sess_B_" + Date.now();
  clearSession(sidB);
  const resB = await mockChatCall(sidB, "I am a farmer from Haryana and own 3 acres.", "en");

  console.log("Extracted Profile:", JSON.stringify(resB.cumulativeProfile));
  console.log("Schemes Found:", resB.schemes.length);
  const hasPunjab = resB.schemes.some(s => s.state && s.state.toLowerCase() === 'punjab');
  const passB = resB.cumulativeProfile.state === 'Haryana' &&
                resB.cumulativeProfile.occupation === 'farmer' &&
                !hasPunjab;
  console.log("TEST B RESULT (No Punjab schemes in Haryana query):", passB ? "✅ PASSED" : "❌ FAILED");
  if (!passB) allPassed = false;

  // TEST C: Multi-Turn Profile Accumulation
  console.log("\n-----------------------------------------------------------------------");
  console.log("TEST C: Multi-turn Profile Memory Accumulation");
  const sidC = "test_sess_C_" + Date.now();
  clearSession(sidC);

  await mockChatCall(sidC, "I am a farmer", "en");
  await mockChatCall(sidC, "I am 45 years old", "en");
  await mockChatCall(sidC, "I live in Punjab", "en");
  const resC4 = await mockChatCall(sidC, "What schemes are available for me?", "en");

  console.log("Cumulative Profile across 4 turns:", JSON.stringify(resC4.cumulativeProfile));
  const passC = resC4.cumulativeProfile.occupation === 'farmer' &&
                resC4.cumulativeProfile.age === 45 &&
                resC4.cumulativeProfile.state === 'Punjab' &&
                resC4.schemes.length > 0;
  console.log("TEST C RESULT (Accumulated profile across turns):", passC ? "✅ PASSED" : "❌ FAILED");
  if (!passC) allPassed = false;

  // TEST D: Correction Handling
  console.log("\n-----------------------------------------------------------------------");
  console.log("TEST D: In-Conversation Profile Correction");
  const sidD = "test_sess_D_" + Date.now();
  clearSession(sidD);

  await mockChatCall(sidD, "I am 45 years old and live in Punjab", "en");
  const resD2 = await mockChatCall(sidD, "Actually, I am 48 years old", "en");

  console.log("Corrected Profile:", JSON.stringify(resD2.cumulativeProfile));
  const passD = resD2.cumulativeProfile.age === 48 && resD2.cumulativeProfile.state === 'Punjab';
  console.log("TEST D RESULT (Age updated 45 -> 48):", passD ? "✅ PASSED" : "❌ FAILED");
  if (!passD) allPassed = false;

  // TEST E: Hindi Natural Language Processing
  console.log("\n-----------------------------------------------------------------------");
  console.log("TEST E: Multilingual Hindi Query & Response");
  const sidE = "test_sess_E_" + Date.now();
  clearSession(sidE);
  const resE = await mockChatCall(sidE, "मैं पंजाब का किसान हूँ मेरी उम्र 45 साल है", "hi");

  console.log("Detected Language:", resE.language);
  console.log("Extracted Profile:", JSON.stringify(resE.cumulativeProfile));
  const passE = (resE.language === 'hi' || resE.language === 'mixed') &&
                resE.cumulativeProfile.occupation === 'farmer' &&
                resE.cumulativeProfile.state === 'Punjab';
  console.log("TEST E RESULT (Hindi Language & Profile):", passE ? "✅ PASSED" : "❌ FAILED");
  if (!passE) allPassed = false;

  // TEST F: Punjabi Natural Language Processing
  console.log("\n-----------------------------------------------------------------------");
  console.log("TEST F: Multilingual Punjabi Query & Response");
  const sidF = "test_sess_F_" + Date.now();
  clearSession(sidF);
  const resF = await mockChatCall(sidF, "ਮੈਂ ਪੰਜਾਬ ਦਾ ਕਿਸਾਨ ਹਾਂ ਅਤੇ ਮੇਰੀ ਉਮਰ 45 ਸਾਲ ਹੈ", "pa");

  console.log("Detected Language:", resF.language);
  console.log("Extracted Profile:", JSON.stringify(resF.cumulativeProfile));
  const passF = resF.language === 'pa' &&
                resF.cumulativeProfile.occupation === 'farmer' &&
                resF.cumulativeProfile.state === 'Punjab';
  console.log("TEST F RESULT (Punjabi Language & Profile):", passF ? "✅ PASSED" : "❌ FAILED");
  if (!passF) allPassed = false;

  // TEST G: Natural Multi-Turn Conversation (Section 6 of prompt)
  console.log("\n-----------------------------------------------------------------------");
  console.log("TEST G: Natural Multi-Turn Farmer Dialogue with Crop Identification");
  console.log("Dialogue step-by-step: farmer -> Punjab -> 3 acres -> Mainly wheat");
  const sidG = "test_sess_G_" + Date.now();
  clearSession(sidG);

  // Turn 1
  const t1 = await mockChatCall(sidG, "I am a farmer.", "en");
  console.log("Turn 1 - User: 'I am a farmer.'");
  console.log("Turn 1 - Assistant Follow-up:", t1.followUpQuestion);

  // Turn 2
  const t2 = await mockChatCall(sidG, "Punjab.", "en");
  console.log("Turn 2 - User: 'Punjab.'");
  console.log("Turn 2 - Assistant Follow-up:", t2.followUpQuestion);

  // Turn 3
  const t3 = await mockChatCall(sidG, "Yes, 3 acres.", "en");
  console.log("Turn 3 - User: 'Yes, 3 acres.'");
  console.log("Turn 3 - Assistant Follow-up:", t3.followUpQuestion);

  // Turn 4
  const t4 = await mockChatCall(sidG, "Mainly wheat.", "en");
  console.log("Turn 4 - User: 'Mainly wheat.'");
  console.log("Turn 4 - Cumulative Profile:", JSON.stringify(t4.cumulativeProfile));
  console.log("Turn 4 - Schemes Retrieved:", t4.schemes.length);
  if (t4.schemes.length > 0) {
    console.log("Top Scheme:", t4.schemes[0].schemeName, `(${t4.schemes[0].state})`);
  }

  const passG = t4.cumulativeProfile.occupation === 'farmer' &&
                t4.cumulativeProfile.state === 'Punjab' &&
                t4.cumulativeProfile.landHolding === 3 &&
                Boolean(t4.cumulativeProfile.cropType && t4.cumulativeProfile.cropType.toLowerCase().includes('wheat')) &&
                t4.schemes.length > 0;
  console.log("TEST G RESULT (Farmer -> Punjab -> 3 acres -> Wheat):", passG ? "✅ PASSED" : "❌ FAILED");
  if (!passG) allPassed = false;

  // TEST H: Session Persistence & Context Recovery after Server Restart
  console.log("\n-----------------------------------------------------------------------");
  console.log("TEST H: Session Context Recovery after Simulated Server Restart");
  const sidH = "test_sess_H_" + Date.now();
  clearSession(sidH);

  // Step 1: User interacts and establishes profile
  await mockChatCall(sidH, "I am a 32 year old farmer from Punjab with 4 acres land", "en");
  const profileBefore = getProfile(sidH);
  console.log("Profile before restart:", JSON.stringify(profileBefore));

  // Step 2: Wait for PostgreSQL write to flush
  await new Promise(r => setTimeout(r, 400));

  // Step 3: Simulate server restart by querying directly from persistent storage
  const persistedSession = await persistent.getSession(sidH);
  console.log("Profile recovered from persistent storage:", JSON.stringify(persistedSession.profile));
  console.log("Message history turns recovered:", persistedSession.messages.length);

  const passH = persistedSession.profile.occupation === 'farmer' &&
                persistedSession.profile.age === 32 &&
                persistedSession.profile.state === 'Punjab' &&
                persistedSession.profile.landHolding === 4 &&
                persistedSession.messages.length >= 2;
  console.log("TEST H RESULT (Context Recovery from Persistent Store):", passH ? "✅ PASSED" : "❌ FAILED");
  if (!passH) allPassed = false;

  console.log("\n=======================================================================");
  console.log("ALL 8 CONVERSATION TESTS FINISHED — OVERALL:", allPassed ? "ALL 8 PASSED ✅" : "SOME FAILED ❌");
  console.log("=======================================================================");

  process.exit(allPassed ? 0 : 1);
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

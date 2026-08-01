const axios = require('axios');

async function checkRobotsTxt(baseUrl) {
  try {
    const robotsUrl = `${baseUrl}/robots.txt`;
    console.log(`🔍 Checking robots.txt at: ${robotsUrl}`);
    
    const response = await axios.get(robotsUrl, {
      headers: { 'User-Agent': 'FlyRankInternScraper/1.0 (contact@flyrank.ai)' }
    });

    console.log('✅ robots.txt fetched successfully!');
    console.log('--- Content Preview ---');
    console.log(response.data.slice(0, 300)); // Show top 300 chars
    console.log('-----------------------\n');
    return true;
  } catch (error) {
    console.log('⚠️ Could not fetch robots.txt (or none exists), proceeding with caution.');
    return true;
  }
}

module.exports = { checkRobotsTxt };
const fs = require('fs');
const path = require('path');

const dataPath = '/Users/gaurangbhatia/Desktop/dell_hackathon/public/data/ai_recommendations.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const mockRawData = {
  telemetry: '{\n  "cpu_temp": 95,\n  "fan_rpm": 0,\n  "status": "critical"\n}',
  ad: '{\n  "user": "jdoe",\n  "role": "admin",\n  "last_login": "2024-06-20"\n}',
  policy: '{\n  "rule": "require_mfa",\n  "status": "violated",\n  "severity": "high"\n}',
  default: '{\n  "status": "ok",\n  "latency": "12ms"\n}'
};

data.forEach((rec, idx) => {
  // Add TTL Expiration (Some expire soon, some later)
  const now = new Date('2024-06-21T09:30:00Z').getTime();
  const ttlOffset = (idx % 3 + 1) * 2 * 60 * 60 * 1000; // 2, 4, 6 hours
  rec.ttlExpiration = new Date(now + ttlOffset).toISOString();

  // Add Blast Radius
  const impactLevels = ['Low', 'Medium', 'High', 'Critical'];
  const impactLevel = impactLevels[idx % 4];
  
  rec.blastRadius = {
    impactLevel: impactLevel,
    dependentSystems: ['Active Directory Sync', 'Local File Share'],
    estimatedDowntime: impactLevel === 'Low' ? '0 mins' : impactLevel === 'Medium' ? '5 mins' : '15+ mins',
    description: `Executing this workflow will cause temporary network isolation. ${impactLevel} risk to dependent services.`
  };

  // Upgrade dataSources from string[] to object[]
  if (Array.isArray(rec.dataSources) && typeof rec.dataSources[0] === 'string') {
    rec.dataSources = rec.dataSources.map((ds, i) => {
      let raw = mockRawData.default;
      if (ds.toLowerCase().includes('telemetry') || ds.toLowerCase().includes('battery')) raw = mockRawData.telemetry;
      if (ds.toLowerCase().includes('policy')) raw = mockRawData.policy;
      if (ds.toLowerCase().includes('directory')) raw = mockRawData.ad;
      
      return {
        label: ds,
        syncTime: new Date(now - (i * 15 * 60 * 1000)).toISOString(),
        rawData: raw
      };
    });
  }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Successfully upgraded ai_recommendations.json!');

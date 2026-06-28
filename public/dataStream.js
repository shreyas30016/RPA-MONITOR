(function() {
  let memoryPool = [];
  let isInitialized = false;

  const randomRange = (min, max) => Math.random() * (max - min) + min;

  const parseCSV = (csvText) => {
    console.log("⚡ [Pipeline Engine] Parsing Official Hackathon CSV into Memory Pool...");
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split('\t').length > lines[0].split(',').length
      ? lines[0].split('\t').map(h => h.trim())
      : lines[0].split(',').map(h => h.trim());
    const parsedData = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].includes('\t') ? lines[i].split('\t') : lines[i].split(',');
      if (values.length === headers.length) {
        let rowObject = { internal_uid: `uid-row-${i}` };
        headers.forEach((header, index) => {
          let val = values[index].trim();
          if (['employee_count', 'annual_revenue_usd', 'customer_count', 'founded_year', 'robots_deployed', 'employee_hours_saved', 'budget_usd', 'annual_savings_usd'].includes(header)) {
            rowObject[header] = parseInt(val, 10) || 0;
          } else if (['market_share_percent', 'roi_percent'].includes(header)) {
            rowObject[header] = parseFloat(val) || 0.00;
          } else {
            rowObject[header] = val;
          }
        });
        parsedData.push(rowObject);
      }
    }
    return parsedData;
  };

  window.initializeRpaStream = async function(callback, csvUrl = '/automation_projects.csv') {
    if (typeof callback !== 'function') {
      console.error("❌ [Pipeline Error] initializeRpaStream requires a callback function.");
      return;
    }
    if (isInitialized) {
      console.warn("⚠️ [Pipeline Warning] Stream already initialized.");
      return;
    }
    try {
      console.log(`📦 [Pipeline Engine] Fetching CSV from: ${csvUrl}`);
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const csvText = await response.text();
      memoryPool = parseCSV(csvText);
      isInitialized = true;
      console.log(`✅ [Pipeline Engine] Mapped ${memoryPool.length} rows into RAM.`);
      console.log("🚀 [Pipeline Engine] Starting 200ms firehose...");
      setInterval(() => {
        if (memoryPool.length === 0) return;
        const batchSize = Math.floor(randomRange(5, 50));
        const incomingBatch = [];
        for (let i = 0; i < batchSize; i++) {
          const targetIndex = Math.floor(randomRange(0, memoryPool.length));
          const row = { ...memoryPool[targetIndex] };
          const isAnomaly = Math.random() > 0.95;
          if (isAnomaly) {
            row.budget_usd += Math.floor(randomRange(-5000000, 5000000));
            row.annual_savings_usd += Math.floor(randomRange(-500000, 500000));
            row.roi_percent = parseFloat((row.roi_percent + randomRange(-5, 5)).toFixed(2));
          } else {
            row.budget_usd += Math.floor(randomRange(-50000, 100000));
            row.annual_savings_usd += Math.floor(randomRange(-10000, 30000));
            row.employee_hours_saved += Math.floor(randomRange(-10, 50));
            row.roi_percent = parseFloat((row.roi_percent + randomRange(-0.5, 0.5)).toFixed(2));
          }
          row.budget_usd = Math.max(0, row.budget_usd);
          row.annual_savings_usd = Math.max(0, row.annual_savings_usd);
          row.employee_hours_saved = Math.max(0, row.employee_hours_saved);
          memoryPool[targetIndex] = row;
          incomingBatch.push(row);
        }
        callback(incomingBatch);
      }, 200);
    } catch (error) {
      console.error("❌ [Pipeline Critical Crash]:", error);
    }
  };
})();
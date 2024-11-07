interface DataForChart {
    date: string;
    timestamp: number;
    Calories: number;
    Minutes: number;
  }
  
  interface CaloriesProgressData {
    period1Average: number;
    period2Average: number;
    change: number;
    changePercentage: number;
  }
  
  type MetricKey = 'Calories' | 'Minutes';
  
  type ProgressResult = {[key in MetricKey]: CaloriesProgressData | null;} & { message?: string };
  
  export const calculate_last_30_days_calories_progress = (data: DataForChart[]): ProgressResult => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
  
    const todayTimestamp = today.getTime();
    const thirtyDaysAgoTimestamp = thirtyDaysAgo.getTime();
  
    // Filter data within the last 30 days
    const filteredData = data.filter((entry) => {
      const entryTimestamp = entry.timestamp;
      return (
        entryTimestamp >= thirtyDaysAgoTimestamp &&
        entryTimestamp <= todayTimestamp
      );
    });
  
    if (filteredData.length === 0) {
      return {
        message: 'No data available for the last 30 days.',
        Calories: null,
        Minutes: null,
      };
    }
  
    // Sort the filtered data by timestamp
    const sortedData = filteredData.sort(
      (a, b) => a.timestamp - b.timestamp
    );
  
    // Divide the data into two 15-day periods
    const period1Start = thirtyDaysAgoTimestamp;
    const period1End = thirtyDaysAgoTimestamp + 15 * 24 * 60 * 60 * 1000 - 1;
    const period2Start = period1End + 1;
    const period2End = todayTimestamp;
  
    const period1Data = sortedData.filter(
      (entry) => entry.timestamp >= period1Start && entry.timestamp <= period1End
    );
  
    const period2Data = sortedData.filter(
      (entry) => entry.timestamp >= period2Start && entry.timestamp <= period2End
    );
  
    // Define the metrics to calculate progress for
    const metrics: MetricKey[] = ['Calories', 'Minutes'];
  
    // Initialize the result object
    const result: ProgressResult = {
      Calories: null,
      Minutes: null,
    };
  
    metrics.forEach((key) => {
      // Calculate average for Period 1
      const period1Total = period1Data.reduce(
        (sum, entry) => sum + entry[key],
        0
      );
      const period1Average =
        period1Data.length > 0 ? period1Total / period1Data.length : 0;
  
      // Calculate average for Period 2
      const period2Total = period2Data.reduce(
        (sum, entry) => sum + entry[key],
        0
      );
      const period2Average =
        period2Data.length > 0 ? period2Total / period2Data.length : 0;
  
      // Calculate change and percentage change
      const change = parseFloat((period2Average - period1Average).toFixed(2));
      const changePercentage =
        period1Average !== 0
          ? parseFloat(((change / period1Average) * 100).toFixed(2))
          : 0;
  
      result[key] = {
        period1Average: parseFloat(period1Average.toFixed(2)),
        period2Average: parseFloat(period2Average.toFixed(2)),
        change,
        changePercentage,
      };
    });
  
    return result;
  };
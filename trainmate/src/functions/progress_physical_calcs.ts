interface PhysicalDataForChart {
    date: string;
    timestamp: number;
    Weight: number;
    BodyFat: number;
    BodyMuscle: number;
  }
  
  interface PhysicalProgressData {
    initialValue: number;
    latestValue: number;
    change: number;
    changePercentage: number;
  }
  
  type MetricKey = 'Weight' | 'BodyFat' | 'BodyMuscle';
  
  type ProgressResult = {[key in MetricKey]: PhysicalProgressData | null;} & {message?: string;};
  
  export const calculate_last_30_days_physical_progress = (data: PhysicalDataForChart[]): ProgressResult => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const todayTimestamp = today.getTime();
    const thirtyDaysAgoTimestamp = thirtyDaysAgo.getTime();
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
        Weight: null,
        BodyFat: null,
        BodyMuscle: null,
      };
    }
  
    const sortedData = filteredData.sort((a, b) => a.timestamp - b.timestamp);

    const metrics: MetricKey[] = ['Weight', 'BodyFat', 'BodyMuscle'];
  
    const result: ProgressResult = {
      Weight: null,
      BodyFat: null,
      BodyMuscle: null,
    };
  
    metrics.forEach((key) => {
      const initialValue = sortedData[0][key];
      const latestValue = sortedData[sortedData.length - 1][key];
  
      const change = parseFloat((latestValue - initialValue).toFixed(2));
      const changePercentage =
        initialValue !== 0 ? (change / initialValue) * 100 : 0;
  
      result[key] = {
        initialValue,
        latestValue,
        change,
        changePercentage: parseFloat(changePercentage.toFixed(2)),
      };
    });
  
    return result;
  };
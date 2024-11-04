export const getFilteredData = (caloriesPerDay: any, period: string) => {
    const today = new Date();
    const daysAgo = period === 'WEEKLY' ? 7 : 14; // Set days based on the selected period
    const filterDate = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return Object.keys(caloriesPerDay)
      .map(key => {
        const [day, month] = caloriesPerDay[key].date.split('/').map(Number);
        const entryDate = new Date(today.getFullYear(), month - 1, day);

        return {
          ...caloriesPerDay[key],
          entryDate,
        };
      })
      .filter(item => {
        return item.entryDate >= filterDate && item.entryDate <= today;
      })
      .map(({ entryDate, ...rest }) => rest) // Keep the original format for the graph
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

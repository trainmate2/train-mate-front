import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DynamicBarChart = ({ topExercisesDone }) => {

  const transformDataForChart = (topExercisesDone) => {
    const chartData = topExercisesDone.map(category => {
      const dataEntry = { name: category.categoryName };
      category.exercises.forEach(exercise => {
        dataEntry[exercise.name] = exercise.count;
      });
      return dataEntry;
    });
    
    const allExercises = topExercisesDone.flatMap(category => category.exercises.map(ex => ex.name));
    const uniqueExercises = [...new Set(allExercises)]; // Eliminar duplicados
    
    return { chartData, uniqueExercises };
  };

  const { chartData, uniqueExercises } = transformDataForChart(topExercisesDone);

  const getRandomColor = (index) => {
    const colors = [
      "#03D5FB",
      "#83E3EE",
      "#4EDAE4",
      "#81E2DF",
      "#56DCC6",
      "#A0E8DB",
      "#26D4B9",
      "#026CC4",
      "#029EE4",
      "#02AED6",
      "#01927C",
      "#02B096",
      "#02AB72",
      "#01814D",
      "#013059",
      "#014F79",
      "#015C6F",
      "#015346",
      "#018867",
      "#01603B"
  ];
    return colors[index % colors.length]; // Repetir colores si son más ejercicios
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip contentStyle={{ backgroundColor: 'black', borderRadius: '5px' }} labelStyle={{ color: 'white' }}/>
        {/* <Legend /> */}
        {uniqueExercises.map((exercise, index) => (
          <Bar key={exercise} dataKey={exercise} stackId="a" fill={getRandomColor(index)} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DynamicBarChart;
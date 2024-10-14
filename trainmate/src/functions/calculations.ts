interface Workout {
    id: number;
    duration: number;
    date: string;
    total_calories: number;
    coach: string;
    training_id: string;
  }
  
export const calculate_calories_and_duration_per_day = (workouts: Workout[]) => {
    const calories_and_duration_per_day: { [date: string]: [number, number] } = {};

    workouts.forEach((workout) => {
        const { date, total_calories, duration } = workout;

        if (calories_and_duration_per_day[date]) {
            calories_and_duration_per_day[date][0] += total_calories;
            calories_and_duration_per_day[date][1] += duration;
        } else {
            calories_and_duration_per_day[date] = [total_calories, duration];
        }
    });

    return calories_and_duration_per_day;
};
export const filterTasks = (tasks, conditions) => {
    return tasks.filter(task => {
        return Object.keys(conditions).every(key => task[key] === conditions[key]);
    });
};
export const initial = {
  columns: {
    'todo': {
      id: 'todo',
      title: 'To Do',
      cards: [
        { id: '1', title: 'Design system review', description: 'Review and update the design system components' },
        { id: '2', title: 'API integration', description: 'Integrate user authentication API' },
        { id: '3', title: 'User testing', description: 'Conduct usability testing for the new features' },
      ]
    },
    'in-progress': {
      id: 'in-progress',
      title: 'In Progress',
      cards: [
        { id: '4', title: 'Database optimization', description: 'Optimize database queries for better performance' },
        { id: '5', title: 'Mobile responsiveness', description: 'Make the app fully responsive for mobile devices' },
      ]
    },
    'review': {
      id: 'review',
      title: 'Code Review',
      cards: [
        { id: '6', title: 'Pull request #123', description: 'Review authentication implementation' },
      ]
    },
    'done': {
      id: 'done',
      title: 'Done',
      cards: [
        { id: '7', title: 'Setup project', description: 'Initial project setup and configuration' },
        { id: '8', title: 'Create mockups', description: 'Design mockups for the main dashboard' },
      ]
    }
  },
  columnOrder: ['todo', 'in-progress', 'review', 'done']
};

export const colors = [
  { bg: 'bg-cyan-500', text: 'text-white' },
  { bg: 'bg-orange-500', text: 'text-white' },
  { bg: 'bg-green-500', text: 'text-white' },
  { bg: 'bg-purple-500', text: 'text-white' },
  { bg: 'bg-red-500', text: 'text-white' },
  { bg: 'bg-blue-500', text: 'text-white' },
  { bg: 'bg-pink-500', text: 'text-white' },
  { bg: 'bg-indigo-500', text: 'text-white' }
];
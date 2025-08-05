import { useRecoilValue } from 'recoil';
import KanbanBoard from './KanbanBoard';
import { isDarkState } from './atoms';

function App() {
  const isDark = useRecoilValue(isDarkState);
  return (
    <div className={`App ${isDark && "dark"}`}>
      <title>Kanban Board</title>
      <KanbanBoard />
    </div>
  );
}

export default App;
import { RecoilState, useRecoilValue } from 'recoil';
import KanbanBoard from './KanbanBoard';
import { isDarkAtom } from './atoms';

function App() {
  const isDark = useRecoilValue(isDarkAtom);
  return (
    <div className="App">
      <title>Kanban Board</title>
      <KanbanBoard />
    </div>
  );
}

export default App;
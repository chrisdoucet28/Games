import { Analytics } from '@vercel/analytics/react';
import LessonGamesGenerator from './LessonGamesGenerator';

function App() {
  return (
    <>
      <LessonGamesGenerator />
      <Analytics />
    </>
  );
}

export default App;
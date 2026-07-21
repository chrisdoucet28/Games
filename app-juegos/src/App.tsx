import { SpeedInsights } from '@vercel/speed-insights/react';
import LessonGamesGenerator from './LessonGamesGenerator';

function App() {
  return (
    <>
      <LessonGamesGenerator />
      <SpeedInsights />
    </>
  );
}

export default App;
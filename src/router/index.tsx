import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import Home from '@/pages/Home';
import LessonGenerator from '@/pages/LessonGenerator';
import DifficultyAnalyzer from '@/pages/DifficultyAnalyzer';
import ExerciseWorkshop from '@/pages/ExerciseWorkshop';
import ScriptGenerator from '@/pages/ScriptGenerator';
import ResourceLibrary from '@/pages/ResourceLibrary';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'lesson-generator', element: <LessonGenerator /> },
      { path: 'difficulty-analyzer', element: <DifficultyAnalyzer /> },
      { path: 'exercise-workshop', element: <ExerciseWorkshop /> },
      { path: 'script-generator', element: <ScriptGenerator /> },
      { path: 'resource-library', element: <ResourceLibrary /> },
    ],
  },
]);

export default router;

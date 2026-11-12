import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CourseApp from './CourseApp';
import AdminCoursePage from './pages/admin/AdminCoursePage';

const theme = createTheme();

// FR-03: 라우터를 들이기 전까지 /admin 경로면 관리자 화면을, 그 밖에는 목록·상세(FR-01, FR-02)를 보여 준다.
const Page = window.location.pathname.startsWith('/admin') ? AdminCoursePage : CourseApp;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Page />
    </ThemeProvider>
  </StrictMode>,
);

import { createBrowserRouter } from "react-router-dom";
import { Login } from "./pages/auth/Login.tsx";
import { Signup } from "./pages/auth/Signup.tsx";
import { MainLayout } from "./composants/MainLayout.tsx";
import { Home } from "./pages/Home.tsx";
import { Realisateur } from "./pages/admin/Realisateur.tsx";
import { Admin } from "./pages/admin/Admin.tsx";
import { CreateFilm } from "./pages/film/CreateFilm.tsx";
import { Film } from "./pages/film/Film.tsx"

export const router = createBrowserRouter([
  {
    path: 'auth/login',
    element: <Login/>
  }, {
    path: 'auth/register',
    element: <Signup/>
  }, {
    element: <MainLayout/>,
    children: [
      {
        index: true,
        element: <Home/>,
      }, {
      path: 'admin',
        element: <Admin/>,
      }, {
      path: 'admin/film',
        element: <CreateFilm/>
      }, {
      path: 'admin/realisateur',
        element: <Realisateur/>
      }, {
      path: 'film/:id',
        element: <Film/>
      }
    ]
  }
])

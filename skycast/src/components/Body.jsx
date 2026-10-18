import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from "./Home";
import Browse from "./Browse"

function Body() {

    const appRouter = createBrowserRouter([
        {
            path: "/",
            element: <Home />
        },

        {
          path: "/browse",
          element:<Browse />
        },

    ]);
  return (
    <RouterProvider router={appRouter} />
  )
}

export default Body
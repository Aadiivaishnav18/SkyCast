import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from "./Home";

function Body() {

    const appRouter = createBrowserRouter([
        {
            path: "/",
            element: <Home />
        },

    ]);
  return (
    <RouterProvider router={appRouter} />
  )
}

export default Body
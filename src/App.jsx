import React from "react";
import Login, { action as loginAction } from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage, { loader as homeLoader } from "./pages/HomePage/HomePage";
import LoginLayout from "./components/Layout/LoginLayout";
import HomeLayout from "./components/Layout/HomeLayout";
import RequestPage, {
  action as requestAction,
} from "./pages/RequestPage/RequestPage";
import Error from "./pages/Error/Error";
import { action as logoutAction } from "./pages/Login/Logout";
import { checkAuthLoader } from "./util/auth";
import Approval, { loader as approvalLoader } from "./pages/Approval/Approval";
import Record, { loader as recordLoader } from "./pages/Record/Record";
import SuperUser from "./pages/SuperUser/SuperUser";
import ResubmitForm, {
  action as resubmitAction,
} from "./pages/HomePage/ResubmitForm";
import Technician, {
  loader as technicianLoader,
} from "./pages/Technician/Technician";
import TechnicianSchedule from "./pages/Technician/TechnicianSchedule";
import RecordDetails from "./pages/Record/RecordDetails";
import History, { loader as historyLoader } from "./pages/History/History";
import Profile, {loader as profileLoader} from "./pages/Profile/Profile";
import Chat, {loader as chatLoader} from "./pages/Chat/Chat";
import DetailsModal from "./components/UI/DetailsModal";
import LandingPage from "./pages/LandingPage/LandingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <Login />, action: loginAction },
      { path: "register", element: <Register /> },
    ],
  },
  {
    path: "/home/:user_id",
    element: <HomeLayout />,
    id: "home",
    loader: homeLoader,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: checkAuthLoader,
      },
      {
        path: "request",
        element: <RequestPage />,
        loader: checkAuthLoader,
        action: requestAction,
      },
      {
        path: "resubmit/:requestId",
        element: <ResubmitForm />,
        loader: checkAuthLoader,
        action: resubmitAction,
      },
      {
        path: "history",
        element: <History />,
        loader: historyLoader,
      },
      {
        path: "history/:requestId",
        element: <DetailsModal />,
      },
      {
        path: "approval",
        id: "approval",
        element: <Approval />,
        loader: approvalLoader,
      },
      {
        path: "record",
        element: <Record />,
        loader: recordLoader,
      },
      {
        path: "record/:requestId",
        element: <RecordDetails />,
      },
      {
        path: "superuser",
        id: "superuser",
        element: <SuperUser />,
        loader: checkAuthLoader,
      },
      {
        path: "profile",
        id: "profile",
        element: <Profile />,
        loader: profileLoader,
      },
      {
        path: "chat",
        id:"chat",
        element: <Chat />,
        loader: chatLoader,
      },
      {
        path: "technician",
        id: "technician",
        element: <Technician />,
        loader: technicianLoader,
        children: [
          {
            path: "schedule",
            element: <TechnicianSchedule />,
          },
        ],
      },
      {
        path: "logout",
        action: logoutAction,
      },
    ],
  },
]);

const App = () => {
  return (
    <div id="App">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;

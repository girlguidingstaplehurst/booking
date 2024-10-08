import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import reportWebVitals from "./reportWebVitals";
import Layout from "./Layout";
import ShowCalendar from "./ShowCalendar";
import AddEvent from "./AddEvent";
import NoMatch from "./NoMatch";
import Login from "./admin/Login";

import "./index.css";
import AdminLayout from "./admin/AdminLayout";
import { AuthProvider } from "./admin/useAuth";
import { Dashboard, populateDashboard } from "./admin/Dashboard";
import { reviewEvent, ReviewEvent } from "./admin/ReviewEvent";
import { createInvoice, CreateInvoice } from "./admin/CreateInvoice";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route element={<Layout />}>
        <Route
          index
          element={<ShowCalendar />}
          loader={async () => await fetch("/api/v1/events")}
        />
        <Route path="add-event" element={<AddEvent />} />
        <Route path="*" element={<NoMatch />} />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} loader={populateDashboard} />
        <Route
          path="review/:eventID"
          element={<ReviewEvent />}
          loader={({ params }) => reviewEvent(params.eventID)}
        />
        <Route
          path="create-invoice"
          element={<CreateInvoice />}
          loader={({ request }) => {
            const url = new URL(request.url);
            const events = url.searchParams.get("events");
            return createInvoice(events);
          }}
        />
      </Route>
      <Route path="admin/login" element={<Login />} />
    </Route>,
  ),
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="362406102359-frmsjn6et0551pciju1li4mep62thmse.apps.googleusercontent.com">
      <ChakraProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ChakraProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

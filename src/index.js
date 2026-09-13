import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
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
import { reviewEventGroup, ReviewEventGroup } from "./admin/ReviewEventGroup";
import { createInvoice, CreateInvoice } from "./admin/CreateInvoice";
import { ManageInvoice, manageInvoice } from "./admin/ManageInvoice";
import ManagedContent from "./components/ManagedContent";
import { CreateEvents } from "./admin/CreateEvents";
import { CreateEventGroup } from "./admin/CreateEventGroup";
import { Rates, RateEditor, ratesLoader, rateLoader } from "./admin/Rates";
import { KeyholderEditor, Keyholders, keyholderEditorLoader } from "./admin/Keyholders";
import { keyholdersLoader } from "./admin/components/KeyholderSelect";
import { authenticatedLoader, requireAdminAuth } from "./admin/auth";
import Location from "./Location";
import WhatsOn from "./WhatsOn";
import ThankYou from "./ThankYou";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <ManagedContent
              name="kathie-lamb-guide-centre"
              showLastUpdated={false}
            />
          }
        />
        <Route
          path="about"
          element={<ManagedContent name="about" showLastUpdated={false} />}
        />
        <Route
          path="contact"
          element={<ManagedContent name="contact" showLastUpdated={false} />}
        />
        <Route
          path="booking"
          element={<ShowCalendar />}
          loader={async () => await fetch("/api/v1/events")}
        />
        <Route path="add-event" element={<AddEvent />} />
        <Route path="thank-you" element={<ThankYou />} />
        <Route
          path="whats-on"
          element={<WhatsOn />}
          loader={async () => await fetch("/api/v1/events")}
        />
        <Route path="location" element={<Location />} />
        <Route
          path="privacy-policy"
          element={<ManagedContent name="privacy-policy" />}
        />
        <Route
          path="terms-of-hire"
          element={<ManagedContent name="terms-of-hire" />}
        />
        <Route
          path="cleaning-and-damage-policy"
          element={<ManagedContent name="cleaning-and-damage-policy" />}
        />
        <Route path="*" element={<NoMatch />} />
      </Route>

      <Route path="login" element={<Login />} />
      
      <Route path="admin" element={<AdminLayout />} loader={requireAdminAuth}>
        <Route index element={<Dashboard />} loader={authenticatedLoader(populateDashboard)} />
        <Route path="rates" element={<Rates />} loader={authenticatedLoader(ratesLoader)} />
        <Route path="rates/new" element={<RateEditor />} loader={authenticatedLoader(() => null)} />
        <Route path="rates/:rateID/edit" element={<RateEditor />} loader={authenticatedLoader(rateLoader)} />
        <Route path="keyholders" element={<Keyholders />} loader={authenticatedLoader(keyholdersLoader)} />
        <Route path="keyholders/new" element={<KeyholderEditor />} loader={authenticatedLoader(() => null)} />
        <Route
          path="keyholders/:keyholderID/edit"
          element={<KeyholderEditor />}
          loader={authenticatedLoader(keyholderEditorLoader)}
        />
        <Route path="create-events" element={<CreateEvents />} />
        <Route path="create-event-group" element={<CreateEventGroup />} />
        <Route
          path="review/:eventID"
          element={<ReviewEvent />}
          loader={authenticatedLoader(({ params }) => reviewEvent(params.eventID))}
        />
        <Route
          path="review-group/:groupID"
          element={<ReviewEventGroup />}
          loader={authenticatedLoader(({ params }) => reviewEventGroup(params.groupID))}
        />
        <Route
          path="create-invoice"
          element={<CreateInvoice />}
          loader={authenticatedLoader(({ request }) => {
            const url = new URL(request.url);
            const events = url.searchParams.get("events");
            const eventGroup = url.searchParams.get("eventGroup");
            return createInvoice(events, eventGroup);
          })}
        />
        <Route
          path="invoice/:invoiceID"
          element={<ManageInvoice />}
          loader={authenticatedLoader(({ params }) => manageInvoice(params.invoiceID))}
        />
      </Route>
    </Route>,
  ),
);

const theme = extendTheme({
  colors: {
    black: "#1d1d1b",
    brand: {
      300: "#00a7e5",
      500: "#007bc4",
      900: "#161b4e",
    },
  },
  fonts: {
    body: "Poppins, Century Gothic, sans-serif",
    heading: "Poppins, Century Gothic, sans-serif",
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="362406102359-frmsjn6et0551pciju1li4mep62thmse.apps.googleusercontent.com">
      <ChakraProvider theme={theme}>
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

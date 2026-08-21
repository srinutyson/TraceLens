import {BrowserRouter , Routes , Route} from "react-router-dom";
// import { useState,useRef } from "react";
import  TraceList from "./pages/TraceList.jsx";
import  TraceWaterFall from "./pages/TraceWaterFall.jsx";
import { Signup } from "./pages/Signup.jsx";
import { VerifyOtp } from "./pages/VerifyOtp.jsx";

function App(){

      return (
           <BrowserRouter>
           <Routes>

            <Route path = "/project/:projectId" element = {<TraceList/>}>

            </Route>

            <Route path = "/projects/:projectId/traces/:traceId" element = {<TraceWaterFall/>}>

            </Route>
            <Route path = "/signup" element = {<Signup/>}>

            </Route>
            <Route path = "/verify-otp" element = {<VerifyOtp/>}>

            </Route>
           </Routes>
          </BrowserRouter>
      );
}

export default App;
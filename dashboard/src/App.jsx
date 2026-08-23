import {BrowserRouter , Routes , Route} from "react-router-dom";
// import { useState,useRef } from "react";
import  TraceList from "./pages/TraceList.jsx";
import  TraceWaterFall from "./pages/TraceWaterFall.jsx";
import { Signup } from "./pages/Signup.jsx";
import { VerifyOtp } from "./pages/VerifyOtp.jsx";
import { Login } from "./pages/login.jsx";
import { Projects } from "./pages/Projects.jsx";
function App(){

      return (
           <BrowserRouter>
           <Routes>

            <Route path = "/projects/:projectId/traces" element = {<TraceList/>}>

            </Route>

            <Route path = "/projects/:projectId/traces/:traceId" element = {<TraceWaterFall/>}>

            </Route>
            <Route path = "/signup" element = {<Signup/>}>

            </Route>
            <Route path = "/verify-otp" element = {<VerifyOtp/>}>

            </Route>
            <Route path = "/login" element = {<Login/>} >
            </Route>

            <Route path = "/projects" element = {<Projects/>}>
            </Route>
           </Routes>
          </BrowserRouter>
      );
}

export default App;
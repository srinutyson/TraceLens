import {BrowserRouter , Routes , Route} from "react-router-dom";
// import { useState,useRef } from "react";
import  TraceList from "./pages/TraceList.jsx";
import  TraceWaterFall from "./pages/TraceWaterFall.jsx";

function App(){

      return (
           <BrowserRouter>
           <Routes>

            <Route path = "/" element = {<TraceList/>}>

            </Route>

            <Route path = "/traces/:traceId" element = {<TraceWaterFall/>}>

            </Route>

           </Routes>
          </BrowserRouter>
      );
}

export default App;
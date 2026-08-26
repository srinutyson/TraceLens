import {BrowserRouter , Routes , Route , Navigate} from "react-router-dom";
import  TraceList from "./pages/TraceList.jsx";
import  TraceWaterFall from "./pages/TraceWaterFall.jsx";
import { Signup } from "./pages/Signup.jsx";
import { VerifyOtp } from "./pages/VerifyOtp.jsx";
import { Login } from "./pages/Login.jsx";
import { Projects } from "./pages/Projects.jsx";
import Layout from "./components/Layout.jsx";
import { Evaluations } from "./pages/Evaluations.jsx";
import { ApiKeys } from "./pages/ApiKeys.jsx";



function App(){

      return (
           <BrowserRouter>
           <Routes>

            <Route path="/" element={<Navigate to="/login" replace />}></Route>

            <Route path = "/signup" element = {<Signup/>}></Route>

            <Route path = "/verify-otp" element = {<VerifyOtp/>}></Route>

            <Route path = "/login" element = {<Login/>} ></Route>

            <Route element  = {<Layout/>}>
                  <Route path = "/projects/:projectId/traces" element = {<TraceList/>}></Route>

                  <Route path = "/projects/:projectId/traces/:traceId" element = {<TraceWaterFall/>}></Route>

                  <Route path = "/projects" element = {<Projects/>}></Route>

                  <Route path="/projects/:projectId/evaluations" element={<Evaluations />}></Route>
                  
                  <Route path="/projects/:projectId/keys" element={<ApiKeys />}></Route>

            
            </Route>


           </Routes>
          </BrowserRouter>
      );
}

export default App;
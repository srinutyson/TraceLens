import { Link } from "react-router-dom";



function Trace({id , name}){
     return (
         
           <tr>
              <td>
                {name}
              </td>
               <td>
                 {id}
            
              </td>
              <td>
                <Link to = {`/projects/:projectId/traces/${id}`}>
                  view Trace
                </Link>
              </td>
           </tr>


     )
};
export default Trace;
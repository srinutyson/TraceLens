export const exporter = (spanData)=>{
    fetch('http://localhost:4000/api/ingest',{
        method : 'POST',
       headers :{
         'Content-type' : 'application/json',
         'x-project-id' : 'test-project-nigga'
       },
       body : JSON.stringify(spanData)
    })
    .catch(error =>{

        if(process.env.TRACELENS_DEBUG === 'true') {console.error("TrcaeLens SDK : Failed to export span",error);}
    });

};
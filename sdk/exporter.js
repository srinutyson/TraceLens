export const exporter = (spanData,apiKey)=>{
    fetch('http://localhost:4000/api/ingest',{
        method : 'POST',
       headers :{
         'Content-type' : 'application/json',
         'Authorization' : `Bearer ${apiKey}`
       },
       body : JSON.stringify(spanData)
    })
    .catch(error =>{

        if(process.env.TRACELENS_DEBUG === 'true') {console.error("TrcaeLens SDK : Failed to export span",error);}
    });

};
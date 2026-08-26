export const exporter = (spanData,apiKey,ingestUrl = 'http://localhost:4000/api/ingest')=>{
    fetch(ingestUrl,{
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
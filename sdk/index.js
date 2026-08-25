import { AsyncLocalStorage } from 'node:async_hooks';
import { error } from 'node:console';
import { randomUUID } from 'node:crypto';
import { json } from 'node:stream/consumers';
import { exporter } from './exporter.js';
const asyncLocalStorage = new  AsyncLocalStorage();

export class TraceLens{
    constructor(config = {}){
        this.projectId = config.projectId;
        this.apiKey = config.apiKey;
    }
    async trace(name,fn){
     const traceId = randomUUID();
     const rootContext = {
        traceId : traceId,
        parentSpanId : null
     };
     return asyncLocalStorage.run(rootContext , async () =>{
             return this.startSpan(name , 'custom' , fn)
     });
    }
    async startSpan(name , type , fn){
       const store = asyncLocalStorage.getStore();
       if(!store){
         throw new Error('TraceLens : cannot start a span outside of trace() block .');
       }
     const spanId = randomUUID();
     const startTime = Date.now();
     const spanPayload = {
        spanId : spanId,
        traceId : store.traceId,
        parentSpanId : store.parentSpanId,
        name : name ,
        type : type,
        startTime : startTime,
        endTime : null,
        status : 'success',
        input : null,
        output : null,
        errorMessage : null,
        projectId : this.projectId
     };
   const childContext = {
      traceId : store.traceId,
      parentSpanId : spanId 
   }
   try{

        const result = await asyncLocalStorage.run(childContext,async ()=>{
              return await fn((spanData) =>{
                 if(spanData?.input) spanPayload.input = spanData.input;
                 if(spanData?.output) spanPayload.output = spanData.output;
                 if(spanData?.tokens) spanPayload.tokens = spanData.tokens;
                 if(spanData?.model) spanPayload.model = spanData.model;
                 if(spanData?.cost !== undefined) spanPayload.cost = spanData.cost;
              })
        });
      spanPayload.endTime = Date.now();
      spanPayload.status = 'success';
      exporter(spanPayload,this.apiKey);
      return result ;

   }
   catch(error){
         spanPayload.endTime = Date.now();
         spanPayload.status = 'error';
         spanPayload.errorMessage = error.message;
      
         exporter(spanPayload,this.apiKey);
         throw error;
   }
    }
}
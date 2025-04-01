import { google } from 'googleapis';
var MESSAGE_SCOP = "https://www.googleapis.com/auth/firebase.messaging"
var SCOP= [MESSAGE_SCOP];
var admin = require("firebase-admin");

export const dateFormate = 'DD MMM, YYYY HH:mm:ss';
export class CommonFunction{
    constructor() {}
    async getFcmToken(){
       
        var key = require('./../../service-account.json');
        var jwtClient =new   google.auth.JWT(key.client_email,undefined,key.private_key,SCOP,undefined);
       return await new Promise((res, rej)=>{
        jwtClient.authorize((err,token)=>{
            if(err){
              
            rej( {message:err});
            }else{
           
            res({token:token?.access_token});
            }
        })
        })
    
    }

  
    async sendFcmMessage(token:string,fcmMessage:any) {
   
     

        var serviceAccount =require('./../../service-account.json');
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        const messaging = admin.messaging()
            var payload = {
                notification:fcmMessage,
                'token': token
                };
        
        
            messaging.send(payload)
            .then((result:any) => {
                console.log(result)
            })
    }
}
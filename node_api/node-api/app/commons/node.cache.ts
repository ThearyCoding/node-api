const NodeCache = require("node-cache");
export class NodeLocalCache{
      static cache: any;
      static instance:NodeLocalCache;
     constructor(){
        NodeLocalCache.cache = new NodeCache();
        
     }
     static getCache(){
        return this.cache;
     }
    static getInstance():NodeLocalCache{
       if( NodeLocalCache.instance){
            return NodeLocalCache.instance;
       }else{
            NodeLocalCache.instance = new NodeLocalCache();
            return NodeLocalCache.instance;
       }
     }
    
   
}
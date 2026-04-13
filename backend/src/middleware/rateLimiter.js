import ratelimit from "../config/upstash.js";



const rateLimiter = async (req, res, next) => {
    try {
       const {success} = await ratelimit.limit("my-limit-key");

       if(!success){
        return res.status(429).json({message: "too many requsts"});
       }
       else{
        next();
       }
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export default rateLimiter;
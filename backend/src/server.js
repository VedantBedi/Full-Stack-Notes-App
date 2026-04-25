import express from "express"
import notesRoutes from "./routes/notesRoutes.js"
import {connectdb} from "./config/db.js"
import dotenv from "dotenv"
import rateLimiter from "./middleware/rateLimiter.js";
import cors from 'cors';
import path from "path";



const app = express();
const port = 5001;

const __dirname = path.resolve()
dotenv.config({ path: path.join(__dirname, '../.env') });


if(process.env.NODE_ENV !== "production"){
  app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
}
app.use(express.json()); //middleware
app.use(rateLimiter);

// custom middleware
// app.use((req,res,next) => {
//     console.log(`req method is ${req.method} and req url is ${req.url}`);
//     next();
// })

app.use("/api/notes", notesRoutes);

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname,"../frontend/dist")))

  app.get(/.*/, (req,res) =>{
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
  });

}
connectdb(process.env.MONGOOSE_URL).then(()=>{
    app.listen(port, () => {
    console.log(`sever running at port ${port}`);
});
});


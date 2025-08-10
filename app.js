const express = require("express") 
const app = express()
const dotenv = require("dotenv").config() 
const morgan = require("morgan")
const conntectToDB = require('./config/db')
const productRoute = require("./routes/products.routes")
const userRoute = require("./routes/user.routes")
const authRoutes = require("./routes/auth.routes")

const verifyToken = require("./middleware/verifyToken")
const cors = require('cors');
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  // add your prod URL later, e.g. 'https://yourdomain.com'
];



















// Middleware
app.use(express.urlencoded({ extended: false })); // this will allow us to see the data being sent in the POST or PUT
app.use(express.json()); // Parses JSON bodies

app.use(morgan("dev")) // logs the requests as they are sent to our sever in the terminal
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // you use JWT in Authorization
  credentials: false, // set to true only if you’ll use cookies
}));



app.use("/api/auth",authRoutes)
app.use("/api/products",productRoute)
app.use("/api/users",verifyToken,userRoute)


module.exports = app
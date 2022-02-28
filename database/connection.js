


const mongoose = require("mongoose")
const conn_str = "mongodb://mediheal:u7QhRq3odZbDTkdxkg9dgapZARXOoXcDtbY8uHEfXcc9mzlkTICdzIZsp1CUE3WNo2904xSBBv0ZTXU06fULQA==@mediheal.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@mediheal@";
mongoose.connect(conn_str, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log("Connected successfully..."))
	.catch( (error) => console.log(error) );
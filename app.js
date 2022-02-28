const express = require("express");
const path = require("path"); 
const hbs = require("hbs");
const session = require("express-session");
const app = express();
const port = process.env.PORT || 3000;
var cookieParser = require("cookie-parser");
require("./database/connection");
const Register = require("./models/register");
const static_path = path.join(__dirname,"./public");
const template_path = path.join(__dirname,"./views");
const partials_path = path.join(__dirname,"./partials");
const Medicine = require("./models/medlist");
const Sale = require("./models/sale");
app.use(cookieParser());
app.use(session({
    key: "user_sid",
    secret: "dangerous",
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:100000
    }
}))

app.use((req,res,next)=>{

    if(req.session.user_sid && !req.session.user){
        res.clearCookie("user_sid");
    }
    next();
});

var sessionChecker = (req,res,next)=>{
    if(req.session.user && req.cookies.user_sid){
        res.redirect("/dashboard");
    }
    else{
        next();
    }
}
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(static_path));
app.set("view engine","hbs");
app.set('views',template_path);
hbs.registerPartials(partials_path);

app.get("/",sessionChecker, (req,res)=> {
    res.render("index");
})
app.get("/signup",sessionChecker,(req,res) => {
    res.render("signup");
})


app.post("/signup", async (req,res) => {
    
    try{

        const ssname = req.body.shopname;
        const semail = req.body.emailid;
        const spassword = req.body.password;

        const registershop = new Register({
            shopname : ssname,
            emailid : semail,
            password: spassword
        })

        const registered = await registershop.save();
        res.status(201).render("/login");

    }catch(error){
        res.status(400).send(error);
    }
})
app.get("/login",sessionChecker,(req,res) =>{
    res.render("login");
})

app.post("/login", async (req,res) =>{
    
    try{

        const emailid = req.body.emailid;
        const password = req.body.password;

        const useremail = await Register.findOne({emailid: emailid});
        
        if(useremail.password === password){
            req.session.isauth = true;
            req.session.user = useremail;
            res.redirect("/dashboard");
        }
        else{
            res.render("login");
        }

    }catch(error){
        res.status(400).send(error);
    }
})

app.get("/dashboard", async (req,res)=> {
    if(req.session.user && req.cookies.user_sid){
        const email = req.session.user.email;
        console.log(req.session.user.email);
       
        let date_time = new Date();
        let cmp_date = date_time.getFullYear()+'-'+'0'+ (date_time.getMonth()+1)+'-'+date_time.getDate();

        const lst = await Medicine.find({$and: [{email:email},{expdate:{$eq:cmp_date}}]});
        //console.log(cmp_date);
        const today_sale = await Sale.find({$and: [{email: email},{date:cmp_date}]});

        let val = 0;
        for(let i=0;i<today_sale.length;i++){
            val+= today_sale[i].amount;
        }
        res.render("dashboard",{email: req.session.user.emailid,expcount:lst.length,medlst:lst,total: val,transaction: today_sale.length});
    }
    else{
        res.redirect("/");
    }
})

app.get("/logout",(req,res)=>{
    if(req.session.user && req.cookies.user_sid){
        res.clearCookie("user_sid");
        res.redirect("/");
    }
    else{
        res.redirect("/login");
    }
})


app.get("/medicinelist", async (req,res)=>{
    if(req.session.isauth){

        const emailid = req.session.user.emailid;

        const data = await Medicine.find({emailid:{$eq: emailid}});
        res.render("medicine",{data: data});
    }
    else{
        res.redirect("/");
    }
})

app.post("/addmed", async(req,res)=>{

    try{

        const email = req.session.user.emailid;
        const pname = req.body.pname;
        const ptype = req.body.ptype;
        const price = req.body.price;
        const quantity = req.body.quantity;
        const expdate = req.body.date;
        
        if(email!= null){
            
            const medicine = new Medicine({
                email : email,
                pname: pname,
                ptype : ptype,
                price : price,
                quantity : quantity,
                expdate: expdate
            }) 
            
            const added = await medicine.save();
            res.redirect("/medicinelist");
        }
    }
    catch(error){
        res.status(400).send(error);
    }
});


app.post("/delmed", async(req,res) =>{

    if(req.session.user){
            
        const id = req.body.id;

        const deletedmed = await Medicine.deleteOne({_id:id});
        res.redirect("medicinelist");
    }
    else{
        res.redirect("/");
    }
})

app.get("/sales", async (req,res) =>{

    if(req.session.user){
        const email = req.session.user.emailid;
        
        let date_time = new Date();
        let cmp_date = date_time.getFullYear()+'-'+'0'+ (date_time.getMonth()+1)+'-'+date_time.getDate();

        const mysale = await Sale.find({emailid: email});
        res.render("sales",{data: mysale});
    }
    else{
        res.redirect("/");
    }
})
app.post("/sold", async (req,res)=> {

    if(req.session.user){
        const email = req.session.user.emailid;
        const pname = req.body.pname;
        const quantity = req.body.quantity;
        const getdetails = await Medicine.findOne({$and: [{email:email},{pname:pname}]});
        const qty = parseInt(quantity);
        if(getdetails!=null && parseInt(getdetails.quantity)>=qty){
            var amt = parseInt(getdetails.price);
            amt*= qty;
            let date_time = new Date();
            let cmp_date = date_time.getFullYear()+'-'+'0'+ (date_time.getMonth()+1)+'-'+date_time.getDate();
            let newqty = parseInt(getdetails.quantity)-qty;
            const mysale = new Sale({

                emailid:email,
                commodityname: pname,
                quantity : quantity,
                amount: amt,
                date: cmp_date
            });
            const stat = await mysale.save();

            const newstat = await Medicine.updateOne({$and: [{email: email},{pname:pname}]},{"quantity":newqty.toString()});
            
        }
        res.redirect("/sales");
    }
    else{
        res.redirect("/");
    }

})

app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})

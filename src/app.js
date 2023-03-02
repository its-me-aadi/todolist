const express=require("express");
const bodyParser= require("body-parser");

const mongoose=require('mongoose');
const _ = require("lodash");

const DB='mongodb+srv://itsadityasharma7124:Jaishreeram123@cluster0.rgyn6el.mongodb.net/toDoList?retryWrites=true&w=majority'

const app=express();
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine','ejs');

app.use(express.static('public'))

mongoose.set('strictQuery',false);
// mongoose.connect(DB,{
    // useNewUrlPaser:true,
    // userCreateIndex:true,
    // userUnifiedTopology:true,
    // userFindAndModify:false
// }).then(()=>{
//     console.log("connected successfully");
// }).catch((err)=>console.log(err));
mongoose.connect(DB,function(err){
    if(!err){
        console.log("succcessfully connected");
    }
    else{
        console.log(err);
    }
})
const toDoListSchema=new mongoose.Schema({
    data:String
});

const Item=mongoose.model("Item",toDoListSchema);

const item1=new Item({
    data:"buy food"
});

const item2=new Item({
    data:"cook food"
});
const item3=new Item({
    data:"eat food"
});

const defaultItems=[item1,item2,item3];

const newListItems=new mongoose.Schema({
    name:String,
    items:[toDoListSchema]
});

const List=mongoose.model("list",newListItems);

app.get("/",function(req,res){ 

    Item.find({},function(err,items){
        if(items.length==0){
            Item.insertMany(defaultItems,function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("sucessfully executed");
                    }
                });
                res.redirect("/");
        }
        else{
            res.render("index",{ListTitle:"Today",newListItem:items});
        } 
});    
        
})

app.get("/:topic",function(req,res){
    const newListName=_.capitalize(req.params.topic); 
    List.findOne({name:newListName},function(err,list){
        if(!err){
            if(!list){
                const newList=new List({
                    name:newListName,
                    items:defaultItems
                });
                newList.save();
                res.redirect("/" + newListName);
            }
            else{
                res.render("index",{ListTitle:newListName,newListItem:list.items});
            }   
        }
    });
});

app.post("/",function(req,res){
    let itemName=req.body.newitem;
    let listName=req.body.list;
   if(itemName){
    const newItem=new Item({
        data:itemName
    });

    if(listName==="Today"){
        newItem.save();
        res.redirect("/");
    }
    else
    {
        List.findOne({name:listName},function(err,findList){
            findList.items.push(newItem);
            findList.save();
            res.redirect("/" + listName);
        });
    }
   }
    
});


app.post("/delete",function(req,res){
    let deleteItem=req.body.checkbox;
    let listName=req.body.listName;
    if(listName==="Today"){
        Item.deleteOne({_id:deleteItem},function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("sucessfully deleted");
            }
        });
        console.log(deleteItem);
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteItem}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
   
});

app.get("/about",function(req,res){
    res.render("about");
})
app.listen(3000,function(){
    console.log("server started at 3000");
})
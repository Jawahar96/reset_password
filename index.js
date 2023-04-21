const express =require('express')

const app = express();

const mongodb =require('mongodb');
const { connection } = require('mongoose');

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')


const mongoClient = mongodb.MongoClient

const dotenv =require('dotenv').config()
const url =('mongodb+srv://jawaharsabesan:nSXzTEgQPK8wYv6k@cluster0.n6dtkg8.mongodb.net/?retryWrites=true&w=majority')
// const url =process.env.DB

const PORT = process.env.PORT || 3002
const cors =require('cors')
const DB= "resetpassword"
 
const corsOption ={
    origin :    "http://localhost:3000"
}
// miidleware
app.use(express.json())



let authenticate = (req,res,next)=>{
   
    if(req.header.authorization){
        next()
    try{
    const decode= jwt.verify(req.header.authorization,process.env.SECRET);
   
    if(decode){
        next()
    
}
}catch(error){
    res.status(401).json({message : "Un authorized"})

} 
}
else{
    res.status(401).json({message : "Un authorized"})

}
   
}


app.get('/',authenticate ,function(req,res){
    res.json({message : "Hello Everyone . Please Reset the  Password"});

})
// create user
app.post('/createuser', authenticate ,async function(req,res){
    try{
        const connection =  await mongoClient.connect(url)
        const db = connection.db(DB)
         await db.collection('user').insertOne(req.body)
       await   connection.close()
       res.json({message : "User is inserted"})
}catch(error){
     res.status(500).json({message : "Users are not created properly"})
    }
})

// get the user details


app.get('/getuser', authenticate,async function(req,res){
    try{
    const connection =  await mongoClient.connect(url)
    const db= connection.db(DB)
    let users =  await db.collection('user').find().toArray()
     await connection.close()
     res.json(users)
     res.json({message : "List the user details"})
     console.log(res);
    }catch(error){
        console.log(error);
        res.status(500).json({message : "Cannot list the user details"})
    }

})

// View the user details
app.get('/user/:id', authenticate ,async function(req,res){
    try{
    const connection =  await mongoClient.connect(url)
    const db =connection.db(DB)
    let user= await  db.collection('user').findOne({_id : new mongodb.ObjectId(req.params.id)})
     await connection.close()
     res.json(user)
    }catch(error){
        console.log(error);
        res.status(500).json({message : "User details are not listing properly"})
    }

})

// Edit the user
app.put('/user/:id',  authenticate ,async function(req,res){
    try{
    const connection =  await mongoClient.connect(url)
    const db =connection.db(DB)
  let view =  await  db.collection('user').findOneAndUpdate({_id :new mongodb.ObjectId(req.params.id)}, {$set : req.body});
    await connection.close()
    res.json(view)
    res.json({message : "User details are updated "})

    }catch(error){
        res.status(500).json({message : "User details not updating"})
    }
})

// delete the user
app.delete('/userdelete',  authenticate ,async function(req,res){
    try{
    const connection =  await mongoClient.connect(url)
    const db =connection.db(DB)
  let view =  await  db.collection('user').findOneAndDelete(req.body  );
    await connection.close()
    res.json(view)
    res.json({message : "User details are deleted "})

    }catch(error){
        res.status(500).json({message : "User details not deleted"})
    }
})

app.post('/register', async function(req,res){
    try{

        const connection = await mongoClient.connect(url)
        const db= connection.db(DB)
       let salt= await bcrypt.genSalt()          //$2b$10$ef4dQ1tuydn0lODtMb.ERO
       console.log(salt);
       let hash = bcrypt.hash(req.body.password,salt)
       console.log(hash);
    req.body.password = hash
 await  db.collection('userreg').insertOne(req.body)
          await connection.close()
           res.json({message : "User registered the details successfully"})
    }catch(error){
        console.log(error);
        res.json( error)

    }
})

app.post('/login',async function(req,res){
    try{
    let connection= await mongoClient.connect(url)
    let db = connection.db(DB)
    let users= await db.collection('userreg').findOne({email :req.body.email})
  if(users){
   let compare = await bcrypt.compare(req.body.password,users.password)
   if(compare){
        const  token = jwt.sign({_id : users._id},process.env.SECRET,{expiresIn : "15m"})  
       res.json(token)
       console.log(token)


}else{
    
    res.json({message : "Login credential failed"})
}
  }
  else{
   
    res.status(401).json({message : "Username/password is wrong "})
  }
await connection.close();
    }catch(error){
       
        res.status(500).json({message : "Somethiing went wrong"})
    }
})

app.listen(PORT,()=>{
    console.log(`SERVER IS RUNNING ON THE PORT ${PORT}`);
})
const express = require('express');
const users = require('./MOCK_DATA.json')
const fs = require('fs');
const { emitWarning } = require('process');
const app = express();
const PORT = 3838;

app.use(express.urlencoded({extended:false}))

//routes
//listing the user with the html file 
app.get('/users',(req,res) =>{
    const html = `
    <ul>
    ${users.map((user) => `<li> ${user.first_name}</li>`).join("")}
    </ul>
    `
    return res.send(html)
})

//listing all the user with the json data 
app.get('/api/users',(req,res) =>{
    res.json(users)
})

//listing all the users with the id specified in the path 
app.get('/api/users/:id',(req,res) => {
    const id = Number(req.params.id);
    const user = users.find(user => user.id === id);
    return res.json(user)

})

//for creating a new user we are creating this route

app.post('/api/users',(req,res)=>{
    //TODO: Creating a new user status is pending 
    const bodyData = req.body
    users.push({...bodyData,id:users.length});
    fs.writeFile('./MOCK_DATA.json',JSON.stringify(users),(err,data) =>{
        res.json({status:"Success",id:users.length+1})

    })
})

//for editing user with the specified id 

app.patch('/api/users/:id',(req,res)=>{
    //TODO: editing a user status is pending 

    const id = req.params.id
    const updates = req.body

    fs.readFile('./MOCK_DATA.json','utf-8',(err,data) => {
        if(err){
            return res.status(500).json({status:"Error" , message:"Failed to read the data from the file "})
        }
        let usersdata;
        try{
            usersdata = JSON.parse(data)
        }
        catch(parseErr){
            return res.status(500).json({status:"Error" , message:"Failed to parse the data from the file "})
        }
       
        const userIndex = users.findIndex(user => user.id == id)


        console.log(userIndex)

        if(userIndex === -1){
            return res.status(404).json({ status: "Error", message: "User not found." });
        }

        users[userIndex] = {...users[userIndex], ...updates};

        fs.writeFile('./MOCK_DATA.json',JSON.stringify(users),(err,data) =>{
            if(err){
                return res.status(500).json({status:"Error",message:"Failed to write the users data "})
            }
           return  res.json({ status: "Success", id });
    
        })


    });

})

//for deleting user with the specified id 

app.delete('/api/users/:id',(req,res)=>{
    //TODO: delete a user status is pending 
    console.log(req);
    const id = req.params.id;
    console.log(id);
    fs.readFile('./MOCK_DATA.json','utf-8',(err,data) => {
        if(err){
            return res.status(500).json({status:"Error" , message:"Failed to read the data from the file "})
        }
        let usersdata;
        try{
            usersdata = JSON.parse(data)
        }
        catch(parseErr){
            return res.status(500).json({status:"Error" , message:"Failed to parse the data from the file "})
        }

    const userIndex = users.findIndex(user => user.id == id);
    if(userIndex === -1){
            return res.status(404).json({ status: "Error", message: "User not found." });
    }
    users.splice(userIndex,1)

    fs.writeFile('./MOCK_DATA.json',JSON.stringify(users),(err,data) =>{
        if(err){
            return res.status(500).json({status:"Error",message:"Failed to write the users data "})
        }
        res.json({ status: "Success", id });

    })
    
    })
    
})

//Combining all the routes in this

app.route('/api/users/:id').get((req,res) =>{
    const id = Number(req.params.id);
    const user = users.find(user => user.id === id);
    return res.json(user)
}).patch((req,res) =>{
     //TODO: editing a user  is pending 
     res.json({status:"Status Pending "})
})
.delete((req,res) =>{
    //TODO: deleting a user is pending 
    res.json({status:"Status Pending "})
})

app.listen(PORT,() =>{
    console.log(`Server is running on PORT: ${PORT}`)
})


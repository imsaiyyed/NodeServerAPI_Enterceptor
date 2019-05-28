const express = require("express");
const router = express.Router();
const configs = require("config");
var axios = require("axios");
const Utilities = require("../Utilities/utilities");
const Joi = require("joi");
const { poolPromise } = require("../database/db");
const winston = require("winston");
const moment = require("moment");
var jsonexport = require("jsonexport");
var azure = require("azure-storage");
var accountInfo = require("../config/azureAccount.json");
var VerifyToken = require('../middleware/auth');

//USERS
router.get("/users", async (req, res) => {
  console.log('users');
  var query = "select *  FROM [dbo].[User]";
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

//ACCOUNTS
router.get("/accounts",VerifyToken, async (req, res) => {
  var query = "select * from dbo.account where userId= " + req.UserId + " and isActive=1";
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

router.post("/account",VerifyToken, async (req, res) => {
      var query =  
      'Insert into account (AccountName,UserId,IsActive) values ('+
       '\''+ req.body.AccountName +   '\''+ ',' + '\'' +  req.UserId +  '\', 1'+ ')' ; 
       winston.info('query ' +  query ) ;   
    const pool = await poolPromise;
    const result = await pool.request().query(query); 
    res.status(201).send('success');
});

router.put("/account",VerifyToken, async (req, res) =>{ 
   console.log('req',req.body.AccountId);
                var query = "UPDATE [account] SET AccountName= \'" + req.body.AccountName  +  "\'," +
                  "IsActive="+ req.body.IsActive +
                  " WHERE AccountId = " + req.body.AccountId;
                   console.log('query',query);
               const pool = await poolPromise;
     const result = await pool.request().query(query);
     res.status(201).send('success');   
});

router.delete("/account", VerifyToken,async (req, res) =>{ 
   var query = "UPDATE [account] SET IsActive= 0  WHERE AccountId= " + req.body.AccountId;
   const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');  
});





//CLIENTS
  
router.get("/clients",VerifyToken, async (req, res) => {
  var query = "select * from dbo.client  where userId= " + req.UserId + " and isActive=1" ;
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

router.get("/clients",VerifyToken, async (req, res) => {
  var query = "select * from dbo.client  where userId= " + req.UserId + " and AccountId=" + req.query.AccountId + " and isActive=1";
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});


router.post("/clients",VerifyToken, async (req, res) => {
  var query =  'Insert into client ([AccountId],ClientName,ClientEmail,Designation,Influence,AllowMonitoring,UserId,IsActive) values ('+ 
            req.body.AccountId +   ',' + 
           '\''+ req.body.ClientName +   '\''+ ',' + 
           '\''+ req.body.ClientEmail +   '\''+ ',' + 
           '\''+ req.body.Designation +   '\''+ ',' + 
             + req.body.Influence +    ',' + 
             + req.body.AllowMonitoring +   ',' +     
             +  req.UserId +  ', 1'+ ')' ; 
   const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.status(201).send('success');
       
});

router.put("/clients",VerifyToken, async (req, res) =>{ 
                var query = "UPDATE [client] SET "+ 
                "[AccountId]=" + req.body.AccountId + ","+
                "[ClientName]= \'" + req.body.ClientName  +   "\'," +
                "[ClientEmail]= \'" + req.body.ClientEmail  +  "\'," +
                "[Designation]= \'" + req.body.Designation  +  "\'," +
                "[Influence]= \'" + req.body.Influence  +  "\'," +
                "[AllowMonitoring]= \'" + req.body.AllowMonitoring  +  "\'," +
                "[UserId]=" + req.UserId + ","+
                "[IsActive]="+ req.body.IsActive +
                " WHERE Id= " + req.body.Id;
               const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');     
});

router.delete("/clients",VerifyToken, async (req, res) =>{ 
   var query = "UPDATE [Client] SET IsActive= 0  WHERE Id= " + req.body.Id;
   const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.status(201).send('success');  
});


//Projects
router.get("/Projects",VerifyToken, async (req, res) => {
  var query = "select * from dbo.Project  where userId= " + req.UserId + " and isActive=1" ;
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

router.post("/Projects", VerifyToken,async (req, res) => {
  var query =  'Insert into Project (ProjectTitle,Tags,StartDate,EndDate,UserId,IsActive) values ('+ 
               '\''+ req.body.ProjectTitle +   '\''+ ',' + 
               '\''+ req.body.Tags +   '\''+ ',' + 
               '\''+ req.body.StartDate +   '\''+ ',' + 
                '\''+ req.body.EndDate +   '\''+ ',' +   
               '\'' +  req.UserId +  '\', 1'+ ')' ; 
   const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');
      
});

router.put("/projects",VerifyToken, async (req, res) =>{ 
                var query = "UPDATE [Project] SET [ProjectTitle]= \'" + req.body.ProjectTitle  +   "\'," +
                "[Tags]= \'" + req.body.Tags  +  "\'," +
                "[StartDate]= \'" + req.body.StartDate  +  "\'," +
                "[EndDate]= \'" + req.body.EndDate  +  "\'," + 
                "[UserId]=" + req.UserId + "," +
                "[IsActive]=" + req.body.IsActive +
                " WHERE ProjectId= " + req.body.ProjectId;
               const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');     
});

router.delete("/projects",VerifyToken, async (req, res) =>{ 
  console.log(req);
   var query = "UPDATE [project] SET IsActive= 0  WHERE ProjectId= " + req.body.ProjectId;
   const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');     
});



//Employee
router.get("/Employees",VerifyToken, async (req, res) => {   
  var query = "select * from dbo.Employee  where userId=" + req.UserId + " and isActive=1";
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
}); 

router.post("/Employees",VerifyToken,async (req, res) => {
  console.log(req.body)

  var query =  'Insert into Employee ([FirstName],[LastName],[Email],Designation,AllowMonitoring,UserId,IsActive) values'+ '('+ 
                '\''+ req.body.FirstName +   '\''+ ',' + 
                '\''+ req.body.LastName +   '\''+ ',' + 
                '\''+ req.body.Email +   '\''+ ',' + 
                 '\''+ req.body.Designation +   '\''+ ',' + 
                 req.body.AllowMonitoring +   ',' +  
                '\'' +  req.UserId +  '\', 1'+ ')' ; 
                console.log(query)
   const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.status(201).send('success');
      
});

router.put("/Employees", VerifyToken,async (req, res) =>{ 
                var query = "UPDATE [Employee] SET [FirstName]= \'" + req.body.FirstName  +   "\'," +
                "[LastName]= \'" + req.body.LastName  +  "\'," +
                "[Email]= \'" + req.body.Email  +  "\'," +
                "[Designation]= \'" + req.body.Designation  +  "\'," +
                "[AllowMonitoring]= " + req.body.AllowMonitoring  +  "," + 
                "[UserId]=" + req.UserId
                +" WHERE Id= " + req.body.Id;
               const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');   
});

router.delete("/Employees",VerifyToken, async (req, res) =>{ 
   var query = "UPDATE [Employee] SET IsActive= 0  WHERE  Id= " + req.body.Id;
   const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');     
});


//ProjectAccountMap
router.get("/ProjectAccountMap",VerifyToken, async (req, res) => {
  var query = "SELECT m.[Id]  ,m.[ProjectId], p.ProjectTitle ,m.[AccountId] ,a.AccountName ,m.[StartDate]"+
              " ,m.[EndDate]      ,m.[Renewable]   ,m.[RenewalDate] ,m.[IsActive],m.[UserId]" +
              "FROM [dbo].[ProjectAccountMap] m"+
              " join dbo.Account  a on m.AccountId =a.AccountId " +
              " join dbo.Project p on m.ProjectId =p.ProjectId  where m.userId=" + req.UserId ;
              console.log(query);
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset); 
});

router.post("/ProjectAccountMap",VerifyToken, async (req, res) => {
  var query =  'Insert into ProjectAccountMap (ProjectId,AccountId,StartDate,EndDate,UserId,IsActive) values'+ '('+ 
                 req.body.ProjectId +    ',' + 
                 req.body.AccountId +    ',' + 
                 '\''+ req.body.StartDate +   '\''+ ',' +
                 '\''+ req.body.EndDate +   '\''+ ',' +   
                  +  req.UserId +  ', 1'+ ')' ; 
    const pool = await poolPromise;
    const result = await pool.request().query(query);
    console.log(result)
    res.status(201).send('success'); 
        
});

router.put("/ProjectAccountMap",VerifyToken, async (req, res) =>{ 
                var query = "UPDATE [ProjectAccountMap] SET "+
                "[ProjectId]=  " + req.body.ProjectId  +   "," +
                "[AccountId]=  " + req.body.AccountId  +   "," +
                "[StartDate]= \'" + req.body.StartDate  +  "\'," +
                "[EndDate]= \'" + req.body.EndDate  +  "\'," + 
                "[UserId]=" + req.UserId + "," + 
                "[IsActive]=" + req.body.IsActive 
                +" WHERE Id= " + req.body.Id;
               const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');   
});

router.delete("/ProjectAccountMap", VerifyToken,async (req, res) =>{ 
   var query = "UPDATE [ProjectAccountMap] SET IsActive= 0  WHERE  Id= " + req.body.Id;
   const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');     
});


//ProjectClientMap
router.get("/ProjectClientMap",VerifyToken, async (req, res) => {
  var query = "SELECT m.Id  ,m.ProjectId, p.ProjectTitle ,m.ClientId , m.AccountId, acc.AccountName ,"+
              "a.ClientName ,m.StartDate ,m.EndDate  ,m.IsActive,m.UserId " +
              " FROM [dbo].[ProjectClientMap] m"+
              " join dbo.Client  a on m.ClientId =a.Id " +
              " join dbo.Account  acc on acc.AccountId =m.AccountId " +
              " join dbo.Project p on m.ProjectId =p.ProjectId  where m.userId=" + req.UserId ;
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset); 
});

router.post("/ProjectClientMap",VerifyToken, async (req, res) => {
  var query =  'Insert into ProjectClientMap (ProjectId,ClientId,AccountId,StartDate,EndDate,UserId,IsActive) values'+ '('+ 
                  req.body.ProjectId +    ',' + 
                  req.body.ClientId +   ',' + 
                  req.body.AccountId +  ',' + 
                '\''+ req.body.StartDate +   '\''+ ',' +
                 '\''+ req.body.EndDate +   '\''+ ',' +   
                  +  req.UserId +  ', 1'+ ')' ; 
    const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.status(201).send('success');      
});

router.put("/ProjectClientMap",VerifyToken, async (req, res) =>{ 
                var query = "UPDATE [ProjectClientMap] SET "+
                "[ProjectId]=  " + req.body.ProjectId  +   "," +
                "[ClientId]=  " + req.body.ClientId  +   "," +
                "[AccountId]=  " + req.body.AccountId  +   "," +
                "[StartDate]= \'" + req.body.StartDate  +  "\'," +
                "[EndDate]= \'" + req.body.EndDate  +  "\'," + 
                "[UserId]=" + req.UserId + "," + 
                "[IsActive]=" + req.body.IsActive 
                +" WHERE Id= " + req.body.Id;
               const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');   
});

router.delete("/ProjectClientMap",VerifyToken, async (req, res) =>{ 
   var query = "UPDATE [ProjectClientMap] SET IsActive= 0  WHERE  Id= " + req.body.Id;
   const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');     
});

//ProjectEmployeeMap
router.get("/ProjectEmployeeMap", VerifyToken,async (req, res) => {
  var query = "SELECT m.Id  ,m.ProjectId, p.ProjectTitle ,m.EmployeeId,a.FirstName ," +
              " m.ManagerId, man.FirstName as ManagerName  ,"+
              " m.StartDate ,m.EndDate   ,m.IsActive,m.UserId " +
              " FROM [dbo].[ProjectEmployeeMap] m"+
              " left join  Employee  a on a.Id =m.EmployeeId " + 
              " left join  Employee  man on man.Id =m.ManagerId " + 
              " join  Project p on m.ProjectId =p.ProjectId  where m.userId=" + req.UserId ;
              
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset); 
});

router.get("/MappingDetails", VerifyToken,async (req, res) => {
  var queryProjectClientMap = "SELECT  map.[Id],map.[ProjectId],map.[ClientId],map.[AccountId]"+
  ",cli.ClientEmail  FROM [Enterceptor].[dbo].[ProjectClientMap] map"+
  " inner join [dbo].[Client] cli on map.ClientId =cli.Id where map.IsActive=1 and map.[UserId]=" +req.UserId;
  
  var queryProjectAccountMap = "SELECT map.[Id],map.[ProjectId],map.[AccountId],acc.AccountName"+
  " FROM [Enterceptor].[dbo].[ProjectAccountMap] map inner join [dbo].Account acc "+
  "on map.AccountId =acc.AccountId where  map.IsActive=1 and map.[UserId]=" +req.UserId;
    
  var queryProjectEmployeeMap = "SELECT map.[Id],map.[ProjectId],map.[EmployeeId],emp.Email FROM "+
  "[Enterceptor].[dbo].[ProjectEmployeeMap] map inner join [dbo].[Employee] emp"+
  " on map.EmployeeId =emp.Id where  map.IsActive=1 and map.[UserId]=" +req.UserId;
    
  const pool = await poolPromise;
  const resultProjectClientMap = await pool.request().query(queryProjectClientMap);
  const resultProjectAccountMap = await pool.request().query(queryProjectAccountMap);
  const resultProjectEmployeeMap= await pool.request().query(queryProjectEmployeeMap);

  res.send({'ProjectClientMap':resultProjectClientMap.recordset,
  'ProjectAccountMap':resultProjectAccountMap.recordset,
  'ProjectEmployeeMap':resultProjectEmployeeMap.recordset}); 
});

router.post("/ProjectEmployeeMap",VerifyToken, async (req, res) => {
  var query =  'Insert into ProjectEmployeeMap (ProjectId,EmployeeId,ManagerId,StartDate,EndDate,UserId,IsActive) values'+ '('+ 
                  req.body.ProjectId +    ',' + 
                  req.body.EmployeeId +   ',' + 
                  req.body.ManagerId +  ',' + 
                '\''+ req.body.StartDate +   '\''+ ',' +
                 '\''+ req.body.EndDate +   '\''+ ',' +   
                  +  req.UserId +  ', 1'+ ')' ; 
    const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.status(201).send('success');      
});

router.put("/ProjectEmployeeMap", VerifyToken,async (req, res) =>{ 
                var query = "UPDATE [ProjectEmployeeMap] SET "+
                " [ProjectId]=  " + req.body.ProjectId  +   "," +
                " [EmployeeId]=  " + req.body.EmployeeId  +   "," +
                " [ManagerId]=  " + req.body.ManagerId  +   "," +
                " [StartDate]= \'" + req.body.StartDate  +  "\'," +
                " [EndDate]= \'" + req.body.EndDate  +  "\'," + 
                " [UserId]=" + req.UserId + "," + 
                " [IsActive]=" + req.body.IsActive 
                +" WHERE Id= " + req.body.Id;
               const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');   
});

router.delete("/ProjectEmployeeMap", VerifyToken,async (req, res) =>{ 
   var query = "UPDATE [ProjectEmployeeMap] SET IsActive= 0  WHERE  Id= " + req.body.Id;
   const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');     
});


router.get("/InfluenceMatrix", VerifyToken,async (req, res) => {
  var query = "select * from dbo.InfluenceMatrix where userId=" + req.UserId ;
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset); 
});



router.get("/Channels",VerifyToken, async (req, res) => {
  var query = "select * from dbo.Channels";
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

//USER CHANNELS
router.get("/UserChannels",VerifyToken, async (req, res) => {
  var query = "SELECT  uc.[Id] ,uc.[UserId]  ,uc.[ChannelId],  c.Channel_Name   ,uc.[IsActive],uc.[LastSync],uc.TriggerTime "+ 
              " FROM [dbo].[UserChannels] uc "+
              " join Channels  c on uc.ChannelId = c.Id where uc.IsActive=1 AND uc.UserId= " + req.UserId ;
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});


router.post("/UserChannels",VerifyToken, async (req, res) => {
  var query =  'Insert into UserChannels (UserId,ChannelId,LastSync,TriggerTime,IsActive) values'+ '('+ 
                  req.UserId +    ',' + 
                  req.body.ChannelId +   ',' +  
                '\''+ req.body.LastSync +   '\''+ ',' + 
                 '\''+ req.body.TriggerTime +   '\''+ 
                ', 1'+ ')' ; 
    const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.status(201).send('success');      
});

router.put("/UserChannels",VerifyToken, async (req, res) =>{ 
                var query = "UPDATE [UserChannels] SET "+
                " [UserId]=  " + req.UserId  +   "," +
                " [ChannelId]=  " + req.body.ChannelId  +   "," + 
                " [LastSync]= \'" + req.body.LastSync  +  "\'," +  
                " [TriggerTime]= \'" + req.body.TriggerTime  +  "\'," +  
                " [IsActive]=" + req.body.IsActive 
                +" WHERE Id= " + req.body.Id;
               const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');   
});

router.delete("/UserChannels", VerifyToken,async (req, res) =>{ 
   var query = "UPDATE [UserChannels] SET IsActive= 0  WHERE  Id= " + req.body.Id;
   const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');     
});

//ChannelConfiguration
router.get("/ChannelConfigurationList",VerifyToken, async (req, res) => {
  var query = " SELECT   [Id],[ChannelId],[Key] FROM [dbo].[ChannelConfiguration]";    		  
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

router.get("/ChannelConfiguration",VerifyToken, async (req, res) => {
  var query = " SELECT   [Id],[ChannelId],[Key] "+ 
          "FROM [dbo].[ChannelConfiguration]   where ChannelId= "+ req.query.ChannelId;    		  
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

router.post("/ChannelConfiguration",VerifyToken, async (req, res) => {
  var query =  'Insert into ChannelConfiguration ( ChannelId,[Key]) values'+ '('+  
                  req.body.ChannelId +   ',' + 
                  '\''+ req.body.Key +   '\''+   ')' ; 
    const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.status(201).send('success');      
});

router.put("/ChannelConfiguration",VerifyToken, async (req, res) =>{ 
                var query = "UPDATE [ChannelConfiguration] SET "+               
                " [ChannelId]=  " + req.body.ChannelId  +   "," + 
                " [Key]= \'" + req.body.Key   +  "\'," +   
                +" WHERE ChannelId= " + req.body.ChannelId;
               const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');   
});

router.delete("/ChannelConfiguration",VerifyToken, async (req, res) =>{ 
   var query = "delete from [ChannelConfiguration]  WHERE  Id= " + req.body.Id   ;
   const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');     
});

//ChannelCredentials
router.get("/ChannelCredentialList",VerifyToken, async (req, res) => {
  var query = " SELECT   c.[Id],c.[UserId] ,c.[ChannelId] ,ch.[Channel_Name]   ,c.[KeyId] ,chk.[Key] ,c.[Value] "+ 
          " FROM [dbo].[ChannelCredentials] c  "+
    		  " left join Channels ch on c.channelId = ch.Id" +
    		  " left join [dbo].[ChannelConfiguration] chk on chk.Id=c.KeyId Where c.UserId="+ req.UserId;
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});


router.get("/ChannelCredentials",VerifyToken, async (req, res) => {
  var query = " SELECT   c.[Id],c.[UserId] ,c.[ChannelId] ,ch.[Channel_Name]   ,c.[KeyId] ,chk.[Key] ,c.[Value] "+ 
          " FROM [dbo].[ChannelCredentials] c  "+
    		  " left join Channels ch on  ch.Id = c.channelId " +
    		  " left join [ChannelConfiguration] chk on chk.Id=c.KeyId "+
          " Where c.ChannelId= "+ req.query.ChannelId + " and c.UserId=" + req.UserId ;   
           
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

router.post("/ChannelCredentials", VerifyToken,async (req, res) => {
  var query =  'Insert into UserChannels (UserId,ChannelId,KeyId,Value) values'+ '('+ 
                  req.body.UserId +    ',' + 
                  req.body.ChannelId +   ',' +  
                  req.body.KeyId +   ',' +   
                '\''+ req.body.Value +   '\''+   ')' ; 
    const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.status(201).send('success');      
});

router.put("/ChannelCredentials", VerifyToken,async (req, res) =>{ 
                var query = "UPDATE [ChannelCredentials] SET "+
                " [UserId]=  " + req.UserId  +   "," +
                " [ChannelId]=  " + req.body.ChannelId  +   "," + 
                " [KeyId]= \'" + req.body.KeyId  +  "\'," +  
                 " [Value]= \'" + req.body.Value  +  "\' "  
                +" WHERE Id= " + req.body.Id;
               const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');   
});

router.delete("/ChannelCredentials",VerifyToken, async (req, res) =>{ 
   var query = "delete from [ChannelCredentials]  WHERE  Id= " + req.body.Id   ;
   const pool = await poolPromise;
    const result = await pool.request().query(query);
     res.status(201).send('success');     
});






// Sentiment data for dashboard


router.get("/Tweets",VerifyToken, async (req, res) => {
  var query = "SELECT TOP(5)  [Id]  ,[UserId]  ,[TagId]  ,[CreatedAt]  ,[TextMessage]  ,[HashTags]  ,[UserMentions]"+
  "  ,[UserName]  ,[RetweetCount]  ,[FavoriteCount]  ,[Classification]  ,[SentimentScore]"+
  "FROM [Enterceptor].[dbo].[TwitterSentimentData] Order by [CreatedAt] desc ";
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});


router.get("/Sentiments",VerifyToken, async (req, res) => {
  var query = "SELECT TOP 5 Accountname ,Sentiment ,COUNT(*)as Value "+
  "FROM [Enterceptor].[dbo].[EmailSentimentData]  "+
  "GROUP BY sentiment , accountname "+
  "HAVING Sentiment = '"+  req.query.Sentiment+"' ORDER BY  Accountname ";    		  
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

router.get("/SentimentTrend",VerifyToken, async (req, res) => {
  var query = "SELECT  DatePart(month, localtimestamp) as Month,avg( Sentimentscore ) as AverageSentiment  FROM [Enterceptor].[dbo].[EmailSentimentData]  group by datePart(month, localtimestamp)  order by datePart(month, localtimestamp)";
		  
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});
router.get("/TweetSentimentTrend",VerifyToken, async (req, res) => {
  var query = "SELECT  DatePart(day, createdat) as Day,avg( Sentimentscore ) as AverageSentiment  FROM [Enterceptor].[dbo].[TwitterSentimentData]  group by datePart(day, createdat)  order by datePart(day, createdat)";
		  
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

router.get("/SentimentTrendTwitter",VerifyToken, async (req, res) => {
  var query = "SELECT  DatePart(month, localtimestamp) as Month,avg( Sentimentscore ) as AverageSentiment  FROM [Enterceptor].[dbo].[EmailSentimentData]  group by datePart(month, localtimestamp)  order by datePart(month, localtimestamp)";
		  
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

router.get("/SentimentSalesforce",VerifyToken, async (req, res) => {
  var query = "SELECT  DatePart(month, localtimestamp) as Month,avg( Sentimentscore ) as AverageSentiment  FROM [Enterceptor].[dbo].[EmailSentimentData]  group by datePart(month, localtimestamp)  order by datePart(month, localtimestamp)";
		  
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});
router.get("/CategoryCount",VerifyToken, async (req, res) => {
  var query = "SELECT  [Categorization],COUNT([Categorization]) AS Count FROM [Enterceptor].[dbo].[EmailSentimentData] WHERE CAST([Categorization] as varchar) != 'NULL' GROUP BY [Categorization] ORDER BY [Categorization]";

  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

// SELECT DatePart(week, localtimestamp) as Week,  month(localtimestamp) as Month, Sentimentscore FROM [Enterceptor].[dbo].[EmailSentimentData]
// order by DatePart(week, localtimestamp)

module.exports = router;

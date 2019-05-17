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

router.post("/", async (req, res) => {
  const { error } = validate(req.body);

  if (error) {
    winston.error("Error occurred ", error.message);
    res.status(400).send(error.details[0].message);
    return;
  }
  let EmailBody = req.body.Body;
  let Subject = req.body.Subject;
  let ConversationId = req.body.ConversationId;
  let Sender = req.body.From;
  let ToList = Utilities.extractEmails(req.body.ToList);
  let CCList =
    req.body.CCList != undefined
      ? Utilities.extractEmails(req.body.CCList)
      : req.body.CCList;
  let Domain = Utilities.extractDomain(Sender);
  //let AccountName = Utilities.extractAccountName(Domain);
  let AccountName = Utilities.extractAccountNameWithoutDomain(Domain);

  let LocalTimeStamp = req.body.ReceivedDate;
  let GMTTimeStamp = undefined;

  const response = await axios.post(configs.get("sentimentApiUrl"), {
    Subject: Subject,
    Body: req.body.Body
  });
 
  const Subjectivity = Math.round(response.data.BodySubjectivity * 100) / 100;
  const Keywords = response.data.BodyKeywords;
  const SubjectScore = Math.round(response.data.SubjectScore * 100) / 100;
  var SentimentScore = Math.round(response.data.BodyScore * 100) / 100;
  const Sentiment = Utilities.extractSentiment(SentimentScore);
  const TextAbout = response.data.ThisTextIsAbout;
  const ExplicitContent = response.data.ExplicitContent;
  const SubjectSubjectivity = Math.round(response.data.SubjectSubjectivity * 100) / 100;
  const Categorization = response.data.BodyCategory;
  const Intent = response.data.BodyIntentActions;

   var query =
    "Insert into dbo.EmailSentimentData(Sentiment, ConversationId, Subject, Sender, ToList, CCList, SentimentScore,  SubjectScore, Domain, AccountName,LocalTimeStamp, GMTTimeStamp, Keywords,Subjectivity, Intent, CreatedAt, Categorization ,SubjectSubjectivity,ExplicitContent, TextAbout , EmailBody )values" +
    "(@Sentiment, @ConversationId,@Subject,@Sender,@ToList,@CCList, @SentimentScore, @SubjectScore , @Domain, @AccountName,@LocalTimeStamp, @GMTTimeStamp,@Keywords ,@Subjectivity,@Intent,@CreatedAt,@Categorization,@SubjectSubjectivity,@ExplicitContent,@TextAbout, @EmailBody )";
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("Sentiment", Sentiment)
    .input("ConversationId", ConversationId)
    .input("Subject", Subject)
    .input("Sender", Sender)
    .input("ToList", ToList)
    .input("CCList", CCList)
    .input("SentimentScore", SentimentScore)
    .input("SubjectScore", SubjectScore)
    .input("Domain", Domain)
    .input("AccountName", AccountName)
    .input("LocalTimeStamp", LocalTimeStamp)
    .input("GMTTimeStamp", GMTTimeStamp)
    .input("Keywords", Keywords)
    .input("Subjectivity", Subjectivity)
    .input("Intent", Intent)
    .input("CreatedAt", new Date())
    .input("Categorization", Categorization)
    .input("SubjectSubjectivity", SubjectSubjectivity)
    .input("ExplicitContent", ExplicitContent)
    .input("TextAbout", TextAbout)
    .input("EmailBody", EmailBody)
    .query(query);
   
  res.status(201).send(response.data);
});

router.post("/test", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    winston.error("Error occurred ", error.message);
    res.status(400).send(error.details[0].message);
    return;
  }

  let Subject = req.body.Subject;
  let ConversationId = req.body.ConversationId;
  let Sender = req.body.From;
  let ToList = Utilities.extractEmails(req.body.ToList);
  let CCList =
    req.body.CCList != undefined
      ? Utilities.extractEmails(req.body.CCList)
      : req.body.CCList;
  let Domain = Utilities.extractDomain(Sender);
  //let AccountName = Utilities.extractAccountName(Domain);
  let AccountName = Utilities.extractAccountNameWithoutDomain(Domain);
  let LocalTimeStamp = req.body.ReceivedDate;
  let GMTTimeStamp = undefined;

  const response = await axios.post(configs.get("sentimentApiUrl"), {
    Subject: Subject,
    Body: req.body.Body
  });

  const SentimentScore = response.data.BodyScore.toFixed(2);
  const Sentiment = Utilities.extractSentiment(SentimentScore);
  const SubjectScore = response.data.SubjectScore.toFixed(2);
  const Keywords = response.data.BodyKeywords;
  const Subjectivity = response.data.BodySubjectivity.toFixed(2);
  const Intent = response.data.BodyIntentActions;

  var query =
    "Insert into dbo.SentimentAnalysisMetadataTest(Sentiment, ConversationId, Subject, Sender, ToList, CCList, SentimentScore, SubjectScore, Domain, AccountName,LocalTimeStamp, GMTTimeStamp, Keywords, Subjectivity, Intent, CreatedAt )values" +
    "(@Sentiment, @ConversationId,@Subject,@Sender,@ToList,@CCList,@SentimentScore, @SubjectScore , @Domain, @AccountName, @LocalTimeStamp, @GMTTimeStamp,@Keywords ,@Subjectivity,@Intent,@CreatedAt)";

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("Sentiment", Sentiment)
    .input("ConversationId", ConversationId)
    .input("Subject", Subject)
    .input("Sender", Sender)
    .input("ToList", ToList)
    .input("CCList", CCList)
    .input("SentimentScore", SentimentScore)
    .input("SubjectScore", SubjectScore)
    .input("Domain", Domain)
    .input("AccountName", AccountName)
    .input("LocalTimeStamp", LocalTimeStamp)
    .input("GMTTimeStamp", GMTTimeStamp)
    .input("Keywords", Keywords)
    .input("Subjectivity", Subjectivity)
    .input("Intent", Intent)
    .input("CreatedAt", new Date())
    .query(query);

  res.status(201).send(response.data);
});

router.get("/lastSync", async (req, res) => {
  var query =
    "select max(LocalTimeStamp) as LastSyncTime from dbo.SentimentAnalysisMetadata";
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset[0]);
});

router.get("/emaildata", async (req, res) => {
  var query = "select * from dbo.EmailSentimentData";
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

router.get("/TwitterDetails", async (req, res) => {
  var query = "select *  FROM [Enterceptor].[dbo].[TwitterDetails] ";
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

router.get("/TwitterTags", async (req, res) => {
  var query = "select *  FROM [dbo].[TwitterTags]";
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});


router.get("/SalesforceDetails", async (req, res) => {
  var query = "select * from [Enterceptor].[dbo].[SalesforceDetails]";
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

router.post("/TwitterSentimentData", async (req, res) => {
  var query =  'Insert into [dbo].[TwitterSentimentData]  ([UserId]  ,[TagId]  ,[CreatedAt]  ,[TextMessage]  ,[HashTags]  ,[UserMentions]  ,[UserName]  ,[RetweetCount]  ,[FavoriteCount]  ,[NeutralProb]  ,[NegativeProb]  ,[PositiveProb]  ,[Classification]) values ('+ 
            req.body.UserId +   ',' + 
            req.body.TagId +   ',' + 
            '\''+ req.body.CreatedAt +   '\''+ ',' +
           '\''+ req.body.TextMessage +   '\''+ ',' + 
           '\''+ req.body.HashTags +   '\''+ ',' + 
           '\''+ req.body.UserMentions +   '\''+ ',' + 
           '\''+ req.body.UserName +   '\''+ ',' + 
           req.body.RetweetCount +   ',' + 
           req.body.FavoriteCount +   ',' + 
           req.body.NeutralProb +   ',' + 
           req.body.PositiveProb +   ',' + 
           req.body.NegativeProb +   ',' + 
           '\''+ req.body.Classification +   '\''+ ',' + 
                ')' ; 
   const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.status(201).send('success');
       
});
router.get("/ExchangeServerDetails", async (req, res) => {
  var query = "SELECT  [Id]  ,[ServiceAccountEmail]  ,[ServiceAccountPassword]"+
  "  ,[ServiceAccountAutoDiscoverUrl]  ,[ClientName]  ,[IsActive]  ,[UserId]  ,[LastSync]"+
  "FROM [Enterceptor].[dbo].[ExchangeDetails] WHERE [UserId]="+req.query.UserId;
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});
// "UserId": userInfo['UserId'],
//             "TagId": tagInfo['Id'],
//             "CreatedAt":str(str(CreatedDate.month)+'/'+str(CreatedDate.day)+'/'+str(CreatedDate.year)+' '+str(CreatedDate.hour)+':'+str(CreatedDate.minute)+':'+str(CreatedDate.second)),
//             "TextMessage": tweet.text,
//             "HashTags": hashTasgString,
//             "UserMentions": mentionedUsersString,
//             "UserName": tweet.user.screen_name,
//             "RetweetCount": tweet.retweet_count,
//             "FavoriteCount": tweet.favorite_count,
//             "NeutralProb": str(result[0]),
//             "PositiveProb": str(result[1]),
//             "NegativeProb": str(result[2]),
//             "Classification": str(result[3])

router.get("/emailList", async (req, res) => {
  var query = "select Email from dbo.EmailList WHERE track=1 AND UserId="+req.query.UserId;
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

router.get("/verifiedEmails", async (req, res) => {
  var query = "select Id, Subject, Verified , IsExported from dbo.EmailSentimentData WHERE (Verified = 0 OR Verified = 1) And IsExported = 0";
  const pool = await poolPromise;
  const result = await pool.request().query(query);
  res.send(result.recordset);
});

router.put("/emaildata/:Id", async (req, res) => {
    var query = 'UPDATE dbo.EmailSentimentData SET Verified ='+ req.body.Verified + 'WHERE Id = '+ req.params.Id;
    const pool = await poolPromise;
    const result = await pool.request()
        .query(query);
    res.send(result.recordset);
})

router.post("/emaildataupdate", async (req, res) => {
    var query = 'UPDATE dbo.EmailSentimentData SET IsExported = 1 WHERE Id = '+ req.body.Id;
    const pool = await poolPromise;
    const result = await pool.request()
        .query(query);
    res.send(result.recordset);
})

router.post("/emaildata/bulkUpdate", async (req, res) => {
try{
 let emailData = req.body;
  for (var i = 0, len = emailData.length; i < len; i++) {
  var query = 'UPDATE dbo.EmailSentimentData SET IsExported = 1 WHERE Id = '+ emailData[i].Id; 
  const pool = await poolPromise;
  const result = await pool.request().query(query);  
  }
  return res.status(200).send("Success");
} catch (error) {
   return res.status(404).send("Fail");
  }
});

router.post("/emaildata/azurestorage", async (req, res) => {
  jsonexport(req.body, function(err, csvFile) {
    if (err) return console.log(err);
    var azure = require("azure-storage");
    var blobService = azure.createBlobService(
      accountInfo.AccountName,
      accountInfo.AccountKey
    );
    blobService.createBlockBlobFromText(
      "bicontainer",
      "userFeedback.csv",
      csvFile,
      function(error, result, response) {
        if (!error) {
        console.log("file uploaded");
        return res
        .status(200)
        .send("Success");
        } else {
        return res
        .status(404)
        .send("Error");
        }
      }
    );
  });
});

 router.post("/tsvRunEngine", async(req, res)=>{
    try{
       const response = await axios.post(configs.get("tsvRunEngineApiUrl"),{
     });
     return res.status(200).send(response.data);
    }
    catch(error){
    return res.status(404).send(error);
   }
 })

 

function validate(email) {
  const schema = {
    Subject: Joi.string().required(),
    Body: Joi.string().required(),
    From: Joi.string().email(),
    ConversationId: Joi.string().required(),
    ToList: Joi.string().required(),
    CCList: Joi.string()
      .allow("")
      .optional(),
    ReceivedDate: Joi.any().optional()
  };
  return Joi.validate(email, schema);
}

module.exports = router;

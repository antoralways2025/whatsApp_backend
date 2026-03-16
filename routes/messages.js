router.post("/voice",upload.single("audio"),async(req,res)=>{

try{

const result = await cloudinary.uploader.upload(req.file.path,{
resource_type:"video"
});

const message = new Message({
sender:req.body.sender,
receiver:req.body.receiver,
audio:result.secure_url
});

const saved = await message.save();

res.json(saved);

}catch(err){

res.status(500).json(err);

}

});
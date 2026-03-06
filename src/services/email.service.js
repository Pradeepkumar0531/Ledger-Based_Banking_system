const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        type : "OAuth2",
        clientId : process.env.CLIENT_ID,
        clientSecret : process.env.CLIENT_SECRET,
        refreshToken : process.env.REFRESH_TOKEN,
    }
})

transporter.verify((error, success) => {
    if(error){
        console.error("Error, while Connecting Email server", error);
    }
    else{
        console.log("Email server is ready to send messages.");
    }
})

const sendEmail = async (to, subject, text, html)=>{
    try{
        const info = await transporter.sendMail({
            from : `"Backend Ledger" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        })
    }catch(error){
        console.error("Error while sending mails", error);
    }
}
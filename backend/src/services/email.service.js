const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        type : "OAuth2",
        user : process.env.EMAIL_USER,
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

async function sendRegistrationEmail(userEmail, name){
    const subject = "Welcome To Backend Ledger"
    const text = `Hello ${name}\n\n Thank you for registering in Backend Ledger.\n We are delighted to have you on board.\n Best regards,\n Team Backend Ledger`
    const html = `<p> Hello ${name}</p><p>Thank you for registering in Backend Ledger</p>`

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount){
    const subject = "Transaction was Succesful";
    const text = `Hello ${name}\n\n Your Transaction of amount ${amount} to ${toAccount} was Successfully completed. \n Team Backend Ledger`;
    const html = `<p> Hello ${name}</p><p>Your transaction was successfully Completed.</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailedEmail(userEmail, name, amount, toAccount){
    const subject = "Transaction Failed!";
    const text = `Hello ${name}\n\n Your Transaction of amount ${amount} to ${toAccount} was failed due to some technical reasons.\n Team Backend Ledger`;
    const html = `<p> Hello ${name}</p><p>Your transaction was failed, please try again, some time later</p>`;

    await sendEmail(userEmail, subject, text, html);
}


module.exports ={
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailedEmail
};
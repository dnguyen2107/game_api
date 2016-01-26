
var config =
	{
		serverURL : 'https://tchamber.herokuapp.com',
		//MongoDB
		mongoUri:process.env.MONGOLAB_URI || 'mongodb://localhost:27017/tchamber',
		secret:'mysecretkeyfortchamber',
		//MailJet
		mailjetPublicKey: '83c401ae0c2f6fe3320658634fe9afb0',
		mailjetPrivateKey: 'b0b4cc07412f42cda78968e2783ed4c1',
		//Mail Sender
		mailSenderEmail: 'test@go4seven.com',
		mailSenderName: 'Service Team',
		//S3
		defaultBucket: process.env.S3_DEFAULT_BUCKET || 'tchamberdevelopment',
		AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'sampleaccesskey',
		AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'samplesecretaccesskey'
	};

module.exports = config;

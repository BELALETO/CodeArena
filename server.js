const app = require('./app');
const mongoose = require('mongoose');

// connect to database.
const port = process.env.PORT;
const uri = process.env.URI;
const password = process.env.PASSWORD;

(async () => {
  try {
    const connectionString = uri.replace('<PASSWORD>', password);
    await mongoose.connect(connectionString);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

// listen to requests.
mongoose.connection.on('connected', () => {
  app.listen(port, async (err) => {
    if (err) {
      console.error(err);
      await mongoose.disconnect();
      process.exit(1);
    }
    console.log(`Listening on port ${port}`);
  });
});

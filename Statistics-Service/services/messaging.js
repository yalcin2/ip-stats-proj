// Global imports
const amqp = require('amqplib');
const Ws = use('Ws')

// File imports
const database = require('./postgres');

// Declarations
const Env = use('Env');
const amqp_url = Env.get('RABBITMQ_URL');
const WSChannel = Env.get('WEBSOCKET_CHANNEL');
const WSQueue = Env.get('WEBSOCKET_QUEUE');
const WSTag = Env.get('WEBSOCKET_CONSUMER_TAG');

// Process the message by broadcasting it to all the open websocket connections and
// saving it to the SQL Database.
function processMessage(msg) {
  // Convert to string and then parse the content
  const messageContent = JSON.parse(msg.content.toString());

  // Save message content to the database
  database.saveToDB(messageContent);

  // Check if channels and topics are open, if so then broadcast the message content to be displayed on the UI
  const channel = Ws.getChannel(WSChannel);
  if (!channel) return;

  const topic = channel.topic(WSChannel);
  if (!topic) return;

  topic.broadcastToAll(`message`, messageContent.resulting_country);
}

// Asynchronous which will attach a RabbitMQ Message Listener
async function consume() {
  // Create a connection and a channel 
  const connection = await amqp.connect(amqp_url, "heartbeat=60");
  const channel = await connection.createChannel();
  channel.prefetch(10);
  // If the server is going to shut down, then close the open connections/channels
  process.once('SIGINT', async () => { 
    await channel.close();
    await connection.close(); 
    process.exit(0);
  });

  // Listen for the appropriate messages within a certain queue
  await channel.assertQueue(WSQueue, {durable: true});
  await channel.consume(WSQueue, async (msg) => {    
    processMessage(msg);
    await channel.ack(msg);
  }, 
  {
    noAck: false,
    consumerTag: WSTag
  });
}

module.exports = {
    consume: consume
}
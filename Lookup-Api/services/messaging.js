// Global imports
const amqp = require('amqplib');

// Declarations
const Env = use('Env');
const amqp_url = Env.get('RABBITMQ_URL');
const WSExchange = Env.get('WEBSOCKET_EXCHANGE');
const WSQueue = Env.get('WEBSOCKET_QUEUE');
const WSRoutingKey = Env.get('WEBSOCKET_ROUTING_KEY');

// Asynchronous function that will send message through the RabbitMQ Broker.
async function publish(message){
  // Create a connection to the server and a new channel.
  const connection = await amqp.connect(amqp_url, 'heartbeat=60');
  const channel = await connection.createChannel();
  try {
    // Add a new exchange and queue
    await channel.assertExchange(WSExchange, 'direct', {durable: true});
    await channel.assertQueue(WSQueue, {durable: true});
    // then bind them together
    await channel.bindQueue(WSQueue, WSExchange, WSRoutingKey);
    
    // Send the message through the exchange
    await channel.publish(WSExchange, WSRoutingKey, Buffer.from(JSON.stringify(message)));
  } catch(e) { // Handle any errors here
    console.error('Error in publishing message', e);
  } finally {
    // Close the channel and connection to the server
    await channel.close();
    await connection.close();
  }
}

module.exports = {
    publish: publish
}
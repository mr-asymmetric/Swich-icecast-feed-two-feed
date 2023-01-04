const request = require('request');
const icecast = require('icecast');

const streamUrl1 = 'http://icecast-url-1.com';
const streamUrl2 = 'http://icecast-url-2.com';
const endpointUrl = 'http://endpoint-icecast.com';

// Create an Icecast client for the endpoint URL
const endpointClient = icecast.createClient({
  url: endpointUrl,
});

// Helper function to switch between the two streams
async function switchStreams(currentStream, newStream) {
  console.log(`Switching from ${currentStream} to ${newStream}`);

  // Stop the current stream
  currentStream.unpipe(endpointClient);

  // Fetch the new stream
  request.get(newStream).pipe(endpointClient);
}

// Fetch the first stream
request.get(streamUrl1).pipe(endpointClient);

// Monitor the stream for silence and switch to the other stream if necessary
endpointClient.on('metadata', (metadata) => {
  const title = icecast.getTitle(metadata);
  console.log(`Current stream: ${title}`);

  if (title === 'Silence') {
    switchStreams(endpointClient, streamUrl2);
  }
});

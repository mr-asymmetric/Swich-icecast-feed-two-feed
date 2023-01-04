const icecast = require('icecast-client');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// URL of the first Icecast stream
const url1 = "http://example.com/stream1";

// URL of the second Icecast stream
const url2 = "http://example.com/stream2";

// URL of the endpoint Icecast server
const endpointUrl = "http://endpoint.com/stream";

// Create a client for the first stream
const client1 = icecast.get(url1);

// Create a client for the second stream
const client2 = icecast.get(url2);

// Connect to the endpoint Icecast server
const endpoint = icecast.createWriteStream(endpointUrl);

// Stream audio from the first stream to the endpoint server
client1.audioStream.pipe(endpoint);

// Create an analyser node
const analyser = audioContext.createAnalyser();

// Connect the analyser node to the audio stream
client1.audioStream.pipe(analyser);

// Periodically check the volume of the audio being streamed
setInterval(function () {
  // Get the volume of the audio stream
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  const volume = data.reduce((a, b) => a + b, 0) / data.length;

  // If the volume is below a certain threshold, switch to the other stream
  if (volume < 100) {
    client1.stop();
    client2.start();

    // Stream audio from the new stream to the endpoint server
    client2.audioStream.pipe(endpoint);

    // Connect the analyser node to the new audio stream
    client2.audioStream.pipe(analyser);
  }
}, 1000);


import '@tensorflow/tfjs-backend-webgl';
import * as handpose from '@tensorflow-models/handpose'

export async function detectionHand(dom) {
  // Load the MediaPipe handpose model.
  const model = await handpose.load();
  // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain a
  // hand prediction from the MediaPipe graph.
  const predictions = await model.estimateHands(dom);
  if (predictions.length > 0) {
   return predictions
  }else{
   return null
  }
}

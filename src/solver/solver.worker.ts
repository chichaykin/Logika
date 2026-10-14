/// <reference lib="webworker" />
import { handleRequest, type SolverRequest } from './handler';

self.onmessage = (e: MessageEvent<SolverRequest>) => {
  self.postMessage(handleRequest(e.data));
};

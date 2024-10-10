import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
// import nodecallspython from "node-calls-python";
import Docker from 'dockerode';
// import Podman from 'podman-promise';
import fetch from 'node-fetch';

// const {spawn} = require('child_process');

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}
let docker: Docker;
try {
  docker = new Docker();
} catch (err) {
  console.log(err);
}
let runningContainer: Docker.Container;

async function runDockerImage() {
    try {
        // Pull the image
        await docker.pull('quay.io/yangcao/test-py-app:latest', (err: Error, stream: any) => {
            if (err) throw err;
            docker.modem.followProgress(stream, (error, res) => {
                if (error) throw error;
                console.log('Image pulled successfully:', res);
                startContainer();
            });
        });
    } catch (error) {
        console.error('Error pulling image:', error);
    }
}

async function startContainer() {
    try {
        const container = await docker.createContainer({
            Image: 'quay.io/yangcao/test-py-app:latest',
            HostConfig: {
              PortBindings: { "8000/tcp": [{ "HostPort": "8000" }]},
            },
        });
        await container.start();
        runningContainer = container;
        // Optionally attach to the container's logs
        container.attach({stream: true, stdout: true, stderr: true}, (err, stream: any) => {
            if (err) throw err;
            stream.pipe(process.stdout);
        });

        // Wait for the container to finish
        const data = await container.wait();
        console.log('Container exited with code:', data.StatusCode);
    } catch (error) {
        console.error('Error starting container:', error);
    }
}

async function stopContainer() {
  if (runningContainer) {
      try {
          await runningContainer.stop();
          console.log('Container stopped successfully.');
          await runningContainer.remove({ force: true });
      } catch (error) {
          console.error('Error stopping container:', error);
          await runningContainer.remove({ force: true });
      }
  }
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(express.json());
  runDockerImage();
  // const py = nodecallspython.interpreter;
  // console.log("2");
  // py.addImportPath("/Users/stephanie/venv/lib/python3.12/site-packages")
  // const pymodule = await py.import("/Users/stephanie/Documents/RHDH/backstage/0627-backstage/backstage/plugins/node-call-python-backend/src/service/test.py", true);
  // runDockerImage();
  // router.get('/hello-world', async (_, response) => {
  //   try{
  //         const result = await py.call(pymodule, "hello_world");
  //         response.json({data: result});
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });

  // router.get('/multiple', async (req, response) => {
  //   try{
  //         const result = await py.call(pymodule, "multiple", req.body.first , req.body.second);
  //         console.log(result);
  //         response.json({data: result});
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });

  // router.get('/square-root/:number', async (req, response) => {
  //   try{
  //         const result = await py.call(pymodule, "square_root", req.params.number);
  //         console.log(result);
  //         response.json({data: result});
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });
  const BASE_URL = 'http://localhost:8000';
  router.get('/hello', async (_, response) => {
    try {
      const res = await fetch(`${BASE_URL}/hello`);
      const data = await res.json();
      response.json(data);
      console.log('Hello World Response:', data);
    } catch (error) {
        console.error('Error getting hello world:', error);
    }
  });

  router.post('/arr-append/:value', async (request, response) => {
    try {
      const url = new URL(`${BASE_URL}/arr-append`);
      url.searchParams.append('value', request.params.value)
      const res = await fetch(url, {
        method: "POST",
      });
      const data = await res.json();
      response.json(data);
      console.log('arr-append Response:', data);
    } catch (error) {
        console.error('Error post arr-append:', error);
    }
  });


  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());

      // Handle application termination
    process.on('SIGINT', async () => {
        console.log('Received SIGINT. Stopping container...');
        await stopContainer();
        process.exit(0); // Exit the process
    });

    process.on('SIGTERM', async () => {
        console.log('Received SIGTERM. Stopping container...');
        await stopContainer();
        process.exit(0); // Exit the process
    });
  return router;
}

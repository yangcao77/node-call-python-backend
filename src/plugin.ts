import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * nodeCallPythonPlugin backend plugin
 *
 * @public
 */
export const nodeCallPythonPlugin = createBackendPlugin({
  pluginId: 'node-call-python',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({
        httpRouter,
        logger,
        config,
      }) {
        httpRouter.use(
          await createRouter({
            logger,
            config,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
        httpRouter.addAuthPolicy({
          path: '/hello',
          allow: 'unauthenticated',
        });
        httpRouter.addAuthPolicy({
          path: '/arr-append',
          allow: 'unauthenticated',
        });
        httpRouter.addAuthPolicy({
          path: '/hello-world',
          allow: 'unauthenticated',
        });
        httpRouter.addAuthPolicy({
          path: '/multiple',
          allow: 'unauthenticated',
        });
        httpRouter.addAuthPolicy({
          path: '/square-root',
          allow: 'unauthenticated',
        });
      },
    });
  },
});

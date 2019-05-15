const CONFIG_PATH = '.';

exports.SANDBOX_FILES = [
  {
    path: CONFIG_PATH,
    file: 'myinterceptorconfig.json',
    content: JSON.stringify({
      name: 'myInterceptor',
    }),
  },
];

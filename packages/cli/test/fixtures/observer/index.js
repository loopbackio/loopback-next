const CONFIG_PATH = '.';

exports.SANDBOX_FILES = [
  {
    path: CONFIG_PATH,
    file: 'myobserverconfig.json',
    content: JSON.stringify({
      name: 'myObserver',
    }),
  },
];
